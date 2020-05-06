import BaseModel from './base';
import { Selection } from 'monaco-editor';

export interface User {
  id: string;
  name: string;
  selection: Selection;
  secondarySelections: Selection[];
}

export default class UserModel extends BaseModel {
  static create(user: Partial<User>): User {
    return {
      id: `${user.id}`,
      name: user.name,
      selection: null,
      secondarySelections: [],
    };
  }
}
