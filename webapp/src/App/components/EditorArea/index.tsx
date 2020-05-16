import * as React from 'react';

import AutoSizer from 'react-virtualized-auto-sizer';
import * as monaco from 'monaco-editor';

import MonacoEditor, { MonacoEditorProps } from '@/components/MonacoEditor';

const EditorArea: React.FC<{
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor>;
  editorDidMountEffect: MonacoEditorProps['editorDidMountEffect'];
}> = ({ editorRef, editorDidMountEffect }) => {
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
