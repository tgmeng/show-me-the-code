import { css } from 'emotion';

export interface CursorProps {
  color?: string;
}
export const getCursor = ({ color = '#f00' }: CursorProps = {}) => css`
  width: 2px !important;
  background-color: ${color};
`;
