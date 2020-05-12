import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import { noop } from 'lodash';

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

import MonacoEditor from '@/components/MonacoEditor';

import * as style from './style';

function groupDisposableListToDisposeFn(list: monaco.IDisposable[]) {
  return list.reduce<() => void>(
    (fn, disposable) => () => {
      fn();
      disposable.dispose();
    },
    noop
  );
}

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

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const { current: editor } = editorRef;

    const neoDecorationListMap: DecorationByUserIdMap = new Map();

    userList.forEach((user) => {
      const oldDecorationList = decorationListMap.get(user.id) || [];
      const neoDecorationList = editor.deltaDecorations(
        oldDecorationList,
        (user.selection ? [user.selection] : [])
          .concat(user.secondarySelections)
          .map((selection) => ({
            range: selection,
            options: {
              className: style.getCursor({
                isBlinking: isCollapsedSelection(selection),
              }),
            },
          }))
      );
      neoDecorationListMap.set(user.id, neoDecorationList);
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
          console.log(selections);

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
          editorDidMountEffect={(editor) =>
            groupDisposableListToDisposeFn([
              editor.onDidChangeCursorSelection((e) => {
                const { selection, secondarySelections } = e;
                channel?.push(
                  ChannelEventType.Selection,
                  createChannelPayload({
                    userId: user.id,
                    selection,
                    secondarySelections,
                  })
                );
              }),
              editor.onDidChangeModelContent((e) => {
                if (e.versionId === versionIdRef.current + 1) {
                  return;
                }
                channel?.push(
                  ChannelEventType.Edit,
                  createChannelPayload(e.changes)
                );
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
            ])
          }
        />
      )}
    </AutoSizer>
  );
};

export default EditorArea;
