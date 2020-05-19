import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { Socket, Presence, Channel } from 'phoenix';
import { useImmer } from 'use-immer';
import { debounce } from 'lodash';

import * as monaco from 'monaco-editor';
import { usePrevious } from 'react-use';

import { ChannelEventType } from '@/constants/channel-event-type';

import {
  ChannelEditPayload,
  ChannelSyncRequestPayload,
  ChannelSyncPayload,
} from '@/typings';

import {
  createChannelPayload,
  createRange,
  isCollapsedSelection,
} from '@/utils';

import UserModel, { User } from '@/models/user';
import { MonacoEditorProps } from '@/components/MonacoEditor';

import { groupDisposableListToDisposeFn } from './util';

import * as style from './style';

export type DecorationByUserIdMap = Map<string, string[]>;

export default function useChannel() {
  const [user, setUser] = useState<User | null>(null);
  const [channel, setChannel] = useState<Channel>(null);
  const [presence, setPresence] = useState<Presence>(null);
  const [userList, updateUserList] = useImmer<User[]>([]);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const [decorationListMap, setDecorationListMap] = useState<
    DecorationByUserIdMap
  >(() => new Map());
  const versionIdRef = useRef(0);
  const prevUserList = usePrevious(userList);

  const join = useCallback(
    ({
      token,
      roomId,
      userName,
    }: {
      token: string;
      roomId: string;
      userName: string;
    }) => {
      const socket = new Socket('/socket', {
        params: {
          token,
        },
      });

      socket.connect();

      const localChannel = socket.channel(`room:${roomId}`, {
        user_name: userName,
      });

      localChannel
        .join()
        .receive('ok', (resp) => {
          const localUser = UserModel.create({
            id: resp.user_id,
            name: resp.user_name,
            color: resp.color,
          });

          setUser(localUser);

          const localPresence = new Presence(localChannel);
          setPresence(localPresence);

          localChannel.push(
            ChannelEventType.SyncRequest,
            createChannelPayload(undefined)
          );
        })
        .receive('error', (resp) => {
          console.log('unable to join', resp);
        });

      setChannel(localChannel);
    },
    []
  );

  const leave = useCallback(() => {
    [
      ChannelEventType.Edit,
      ChannelEventType.Sync,
      ChannelEventType.Selection,
    ].forEach((type) => channel.off(type));

    channel.leave().receive('ok', () => {
      setChannel(null);
      setPresence(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!presence) {
      return;
    }

    presence.onSync(() => {
      const neoList: User[] = [];
      presence.list((id, { metas: [first] }) => {
        neoList.push(
          UserModel.create({
            id,
            name: first.user_name,
            color: first.color,
            selection: first.selection,
            secondarySelections: first.secondary_selections,
          })
        );
      });
      updateUserList(() => neoList);
    });

    // eslint-disable-next-line consistent-return
    return () => {
      presence.onSync(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presence]);

  const editorDidMountEffect: MonacoEditorProps['editorDidMountEffect'] = useCallback(
    (editor) =>
      groupDisposableListToDisposeFn([
        editor.onDidChangeCursorSelection(
          debounce(
            (e) => {
              const { selection, secondarySelections } = e;
              channel?.push(
                ChannelEventType.Selection,
                createChannelPayload({
                  user_id: user.id,
                  selection,
                  secondary_selections: secondarySelections,
                })
              );
            },
            150,
            {
              leading: false,
              trailing: true,
            }
          )
        ),
        editor.onDidChangeModelContent((e) => {
          if (e.versionId === versionIdRef.current + 1) {
            return;
          }
          channel?.push(ChannelEventType.Edit, createChannelPayload(e.changes));
        }),
        editor.onDidBlurEditorText(() => {
          channel?.push(
            ChannelEventType.Selection,
            createChannelPayload({
              user_id: user.id,
              selection: null,
              secondary_selections: [],
            })
          );
        }),
      ]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const filteredUserList =
      userList?.filter((otherUser) => otherUser.id !== user?.id) || [];

    const { current: editor } = editorRef;

    const neoDecorationListMap: DecorationByUserIdMap = new Map();

    const isExistedSet = new Set();

    filteredUserList.forEach((localUser) => {
      const oldDecorationList = decorationListMap.get(localUser.id) || [];
      const neoDecorationList = editor.deltaDecorations(
        oldDecorationList,
        (localUser.selection ? [localUser.selection] : [])
          .concat(localUser.secondarySelections)
          .map((selection) => ({
            range: selection,
            options: {
              className: style.getCursor({
                color: localUser.color,
                isBlinking: isCollapsedSelection(selection),
              }),
              stickiness:
                monaco.editor.TrackedRangeStickiness
                  .NeverGrowsWhenTypingAtEdges,
            },
          }))
      );
      neoDecorationListMap.set(localUser.id, neoDecorationList);
      isExistedSet.add(localUser.id);
    });

    prevUserList.forEach((localUser) => {
      if (isExistedSet.has(localUser.id)) {
        return;
      }
      // 清理已退出用户的光标
      const oldDecorationList = decorationListMap.get(localUser.id) || [];
      editor.deltaDecorations(oldDecorationList, []);
    });

    setDecorationListMap(neoDecorationListMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userList, user]);

  useEffect(() => {
    if (!channel) {
      return;
    }

    if (!editorRef.current) {
      return;
    }

    const { current: editor } = editorRef;

    const eventOffList = [
      {
        type: ChannelEventType.Edit,
        callback: (e: ChannelEditPayload) => {
          const { body: changes } = e;

          const model = editor.getModel();

          const selections = editor.getSelections();

          versionIdRef.current = model.getVersionId();

          model.pushEditOperations(
            selections,
            changes.map((change) => ({
              range: createRange(change.range),
              text: change.text,
            })),
            () => null
          );

          editor.setSelections(selections);
        },
      },
      {
        type: ChannelEventType.SyncRequest,
        callback: (e: ChannelSyncRequestPayload) => {
          if (e.body.to === user.id) {
            channel.push(
              ChannelEventType.Sync,
              createChannelPayload({
                from: user.id,
                content: editor.getModel().getValue(),
              })
            );
          }
        },
      },
      {
        type: ChannelEventType.Sync,
        callback: (e: ChannelSyncPayload) => {
          if (e.body.from !== user.id) {
            versionIdRef.current = editor.getModel().getVersionId();
            editor.setValue(e.body.content);
          }
        },
      },
    ].map(({ type, callback }) => ({
      type,
      id: channel.on(type, callback),
    }));

    // eslint-disable-next-line consistent-return
    return () => {
      eventOffList.forEach(({ type, id }) => channel.off(type, id));
    };
  }, [channel, user]);

  return useMemo(
    () => ({
      user,
      userList,
      channel,
      presence,
      join,
      leave,
      editorRef,
      editorDidMountEffect,
    }),
    [user, userList, channel, presence, join, leave, editorDidMountEffect]
  );
}
