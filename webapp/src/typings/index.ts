import { Selection } from 'monaco-editor';

import { User } from '@/models/user';

export interface ChannelPayload<T = unknown> {
  user: User;
  body: T;
}

export type ChannelSelectionPayload = ChannelPayload<{
  selection: Selection;
  secondarySelections: Selection[];
}>;
