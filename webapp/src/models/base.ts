import produce from 'immer';

export default class BaseModel {
  static update<T>(user: T, updates: Partial<T>): T {
    return produce(user, () => {
      Object.assign(user, updates);
    });
  }
}
