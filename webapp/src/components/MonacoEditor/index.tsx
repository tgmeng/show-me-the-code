import * as React from 'react';
import { forwardRef, useState, useRef, useEffect } from 'react';

import * as monaco from 'monaco-editor';

import { setRef } from '@/utils/react';

export type Ref = monaco.editor.IStandaloneCodeEditor;

export interface MonacoEditorProps {
  width: number;
  height: number;
  editorDidMountEffect?: (
    editor: monaco.editor.IStandaloneCodeEditor
  ) => () => void;
}

const MonacoEditorRenderFn: React.ForwardRefRenderFunction<
  Ref,
  MonacoEditorProps
> = ({ width, height, editorDidMountEffect }, ref) => {
  const nodeRef = useRef<HTMLDivElement>();
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>(
    null
  );

  useEffect(() => {
    const localEditor = monaco.editor.create(nodeRef.current, {
      value: '',
      language: 'javascript',
    });

    setEditor(localEditor);
  }, []);

  useEffect(() => {
    setRef(ref, editor);
  }, [editor, ref]);

  useEffect(() => (editor ? editorDidMountEffect?.(editor) : undefined), [
    editor,
    editorDidMountEffect,
  ]);

  useEffect(() => {
    if (editor) {
      editor.layout({
        width,
        height,
      });
    }
  }, [width, height]);

  return (
    <div
      ref={nodeRef}
      style={{
        width,
        height,
      }}
    />
  );
};

const MonacoEditor = forwardRef(MonacoEditorRenderFn);

export default MonacoEditor;
