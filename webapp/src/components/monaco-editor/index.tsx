import * as React from 'react';
import { useRef, useEffect } from 'react';

import * as monaco from 'monaco-editor';

const MonacoEditor: React.FC<{ width: number; height: number }> = ({
  width,
  height,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);

  useEffect(() => {
    if (ref.current) {
      const editor = monaco.editor.create(ref.current, {
        value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join(
          '\n'
        ),
        language: 'javascript',
      });
      editorRef.current = editor;
    }
    return (): void => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
      editorRef.current = null;
    };
  }, [ref.current]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.layout({
        width,
        height,
      });
    }
  }, [width, height]);

  return (
    <div
      ref={ref}
      style={{
        width,
        height,
      }}
    />
  );
};

export default MonacoEditor;
