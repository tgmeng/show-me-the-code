import { css, keyframes } from 'emotion';

const blink = keyframes`
  0% {
    visibility: visible;
  }

  100% {
    visibility: hidden;
  }
`;

export interface CursorProps {
  color?: string;
  isBlinking?: boolean;
}
export const getCursor = ({
  color = '#000',
  isBlinking = false,
}: CursorProps = {}) => css`
  min-width: 2px;
  background-color: ${color};
  animation: ${isBlinking ? `${blink} 1s steps(2, start) infinite` : 'none'};
  z-index: -1;
`;
