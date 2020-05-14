import { IRange, Range, Selection } from 'monaco-editor';

export function createChannelPayload<T>(body: T) {
  return {
    body,
  };
}

export function createRange(range: IRange) {
  return new Range(
    range.startLineNumber,
    range.startColumn,
    range.endLineNumber,
    range.endColumn
  );
}

export function isCollapsedSelection(sel: Selection) {
  return (
    sel.startLineNumber === sel.endLineNumber &&
    sel.startColumn === sel.endColumn
  );
}
