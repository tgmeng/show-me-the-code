import { noop } from 'lodash';

import * as monaco from 'monaco-editor';

export function groupDisposableListToDisposeFn(list: monaco.IDisposable[]) {
  return list.reduce<() => void>(
    (fn, disposable) => () => {
      fn();
      disposable.dispose();
    },
    noop
  );
}

export function debounceChanges<T, R extends (...args: unknown[]) => void>(
  onReduce: (result: T, ...args: Parameters<R>) => T,
  getInitialValue: () => T,
  onExecute: (result: T) => void,
  wait = 150
): R {
  let timerId = 0;
  let result: T = getInitialValue();
  return ((...args: Parameters<R>) => {
    result = onReduce(result, ...args);
    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => {
      onExecute(result);
      result = getInitialValue();
    }, wait);
  }) as R;
}
