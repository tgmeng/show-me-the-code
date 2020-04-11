import * as React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

import MonacoEditor from '@/components/monaco-editor';

export default function EditorArea() {
  return (
    <AutoSizer>
      {({ width, height }) => <MonacoEditor width={width} height={height} />}
    </AutoSizer>
  );
}
