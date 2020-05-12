import { Selection, editor } from 'monaco-editor';

export interface ChannelPayload<T = unknown> {
  body: T;
}

export type ChannelSelectionPayload = ChannelPayload<{
  userId: string;
  selection: Selection;
  secondarySelections: Selection[];
}>;

export type ChannelEditPayload = ChannelPayload<editor.IModelContentChange[]>;

export type ChannelSyncRequestPayload = ChannelPayload<{
  to: string;
}>;
export type ChannelSyncPayload = ChannelPayload<{
  from: string;
  content: string;
}>;
