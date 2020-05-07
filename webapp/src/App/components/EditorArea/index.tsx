import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import { noop } from 'lodash';

import AutoSizer from 'react-virtualized-auto-sizer';
import { Channel } from 'phoenix';
import * as monaco from 'monaco-editor';

import { ChannelEventType } from '@/constants/channel-event-type';

import { createChannelPayload } from '@/utils';

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
              className: style.getCursor(),
            },
          }))
      );
      neoDecorationListMap.set(user.id, neoDecorationList);
    });

    setDecorationListMap(neoDecorationListMap);
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
                channel?.push(
                  ChannelEventType.Selection,
                  createChannelPayload({
                    user,
                    body: {
                      selection,
                      secondarySelections,
                    },
                  })
                );
              }),
              editor.onDidChangeModelContent((e) => {
                channel?.push(
                  ChannelEventType.Edit,
                  createChannelPayload({
                    user,
                    body: e.changes,
                  })
                );
              }),
              editor.onDidBlurEditorText((e) => {
                console.log();
                channel?.push(
                  ChannelEventType.Selection,
                  createChannelPayload({
                    user,
                    body: {
                      selection: null,
                      secondarySelections: [],
                    },
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
