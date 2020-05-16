import { Selection } from 'monaco-editor';

import BaseModel from './base';

export interface User {
  id: string;
  name: string;
  color: string;
  selection: Selection;
  secondarySelections: Selection[];
}

export default class UserModel extends BaseModel {
  static create(user: Partial<User>): User {
    return {
      id: `${user.id}`,
      name: user.name,
      color: user.color || '#000',
      selection: null,
      secondarySelections: [],
    };
  }
}
