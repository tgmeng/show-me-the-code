/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { Fragment } from 'react';
import * as ReactDOM from 'react-dom';

import useInput from '@/hooks/useInput';

import ModalLayer from '@/components/Modal/Layer';
import ModalMask from '@/components/Modal/Mask';

export interface EntranceModalProps {
  roomId: string;
  visible: boolean;
  onCreate: (name: string) => void;
  onJoin: (name: string) => void;
}

const EntranceModal: React.FC<EntranceModalProps> = ({
  roomId = '',
  visible = false,
  onCreate,
  onJoin,
}) => {
  const [name, setName] = useInput(
    process.env.NODE_ENV !== 'production' ? '123' : ''
  );
  const isNameEmpty = name.trim().length === 0;
  return (
    // eslint-disable-next-line react/jsx-fragments
    <Fragment>
      {visible && ReactDOM.createPortal(<ModalMask />, document.body)}
      {visible &&
        ReactDOM.createPortal(
          <ModalLayer>
            <div
              css={css`
                width: 500px;
              `}
            >
              {roomId ? (
                <div>
                  <input value={roomId} disabled />
                  <input value={name} onChange={setName} />
                  <button
                    type="button"
                    disabled={isNameEmpty}
                    onClick={() => onJoin(name)}
                  >
                    加入
                  </button>
                </div>
              ) : (
                <div>
                  <input value={name} onChange={setName} />
                  <button
                    type="button"
                    disabled={isNameEmpty}
                    onClick={() => onCreate(name)}
                  >
                    创建
                  </button>
                </div>
              )}
            </div>
          </ModalLayer>,
          document.body
        )}
    </Fragment>
  );
};

export default EntranceModal;
