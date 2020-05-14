import * as React from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';

import AutoSizer from 'react-virtualized-auto-sizer';
import { Channel } from 'phoenix';
import * as monaco from 'monaco-editor';

import {
  ChannelEditPayload,
  ChannelSyncPayload,
  ChannelSyncRequestPayload,
} from '@/typings';

import { ChannelEventType } from '@/constants/channel-event-type';

import {
  createChannelPayload,
  createRange,
  isCollapsedSelection,
} from '@/utils';

import { User } from '@/models/user';

import MonacoEditor, { MonacoEditorProps } from '@/components/MonacoEditor';

import { groupDisposableListToDisposeFn } from './util';
import * as style from './style';

type DecorationByUserIdMap = Map<string, string[]>;

const EditorArea: React.FC<{
  user: User;
  userList: User[];
  channel: Channel;
}> = ({ user = null, userList = [], channel = null }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const [decorationListMap, setDecorationListMap] = useState<
    DecorationByUserIdMap
  >(() => new Map());
  const versionIdRef = useRef(0);

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
                  userId: user.id,
                  selection,
                  secondarySelections,
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
              selection: null,
              secondarySelections: [],
            })
          );
        }),
      ]),

    [user]
  );

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const { current: editor } = editorRef;

    const neoDecorationListMap: DecorationByUserIdMap = new Map();

    userList.forEach((localUser) => {
      const oldDecorationList = decorationListMap.get(localUser.id) || [];
      const neoDecorationList = editor.deltaDecorations(
        oldDecorationList,
        (localUser.selection ? [localUser.selection] : [])
          .concat(localUser.secondarySelections)
          .map((selection) => ({
            range: selection,
            options: {
              className: style.getCursor({
                isBlinking: isCollapsedSelection(selection),
              }),
              stickiness:
                monaco.editor.TrackedRangeStickiness
                  .NeverGrowsWhenTypingAtEdges,
            },
          }))
      );
      neoDecorationListMap.set(localUser.id, neoDecorationList);
    });

    setDecorationListMap(neoDecorationListMap);
  }, [userList]);

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

  return (
    <AutoSizer>
      {({ width, height }) => (
        <MonacoEditor
          ref={editorRef}
          width={width}
          height={height}
          editorDidMountEffect={editorDidMountEffect}
        />
      )}
    </AutoSizer>
  );
};

export default EditorArea;
