import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import { noop } from 'lodash';

import AutoSizer from 'react-virtualized-auto-sizer';
import { Channel } from 'phoenix';
import * as monaco from 'monaco-editor';

import { ChannelEventType } from '@/constants/channel-event-type';

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
  const [decorationMap, setDecorationMap] = useState<DecorationByUserIdMap>(
    () => new Map()
  );

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const { current: editor } = editorRef;

    setDecorationMap(
      userList.reduce<DecorationByUserIdMap>((map, user) => {
        if (user.selection) {
          map.set(
            user.id,
            editor.deltaDecorations(decorationMap.get(user.id) || [], [
              {
                range: user.selection,
                options: {
                  className: style.getCursor(),
                },
              },
            ])
          );
        }
        return map;
      }, new Map())
    );
  }, [userList]);

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
                channel?.push(ChannelEventType.Selection, {
                  user: { id: user.id },
                  body: {
                    selection,
                    secondarySelections,
                  },
                });
              }),
              editor.onDidChangeModelContent((e) => {
                channel?.push(ChannelEventType.Edit, {
                  user: { id: user.id },
                  body: e.changes,
                });
              }),
            ])
          }
        />
      )}
    </AutoSizer>
  );
};

export default EditorArea;
