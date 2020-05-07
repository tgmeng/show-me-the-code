import { css } from 'emotion';

export interface CursorProps {
  color?: string;
}
export const getCursor = ({ color = '#f00' }: CursorProps = {}) => css`
  min-width: 2px;
  background-color: ${color};
`;
