import { MutableRefObject } from 'react';

export function isMutableRefObject<T>(ref: any): ref is MutableRefObject<T> {
  return !!ref?.hasOwnProperty('current');
}

export function setRef<T>(
  ref: ((instance: T | null) => void) | MutableRefObject<T | null> | null,
  value: T
): void {
  if (!ref) {
    return;
  }

  if (isMutableRefObject(ref)) {
    ref.current = value;
  } else if (typeof ref === 'function') {
    ref(value);
  }
}

setRef(null, 123);