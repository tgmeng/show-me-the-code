import {
  useState,
  useCallback,
  ChangeEvent,
  SetStateAction,
  Dispatch,
} from 'react';

export default function useInput<
  S extends string | string[] | number | boolean,
  E extends HTMLInputElement
>(
  initialState: S,
  key = 'value'
): [S, (e: ChangeEvent<E>) => void, Dispatch<SetStateAction<S>>] {
  const [value, setValue] = useState(initialState);

  const setValueFromEvent = useCallback(
    (e: ChangeEvent<E & { [key: string]: S }>) => {
      setValue(e.target[key]);
    },
    []
  );

  return [value, setValueFromEvent, setValue];
}
