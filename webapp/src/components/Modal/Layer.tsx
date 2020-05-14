/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';

const ModalLayerContainer = styled('div')`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  box-sizing: border-box;
  display: flex;
  padding: 20px 0;
  overflow: auto;
`;

const ModalLayerFrame = styled('div')`
  position: relative;
  margin: auto;
  background-color: #fff;
  border: 0;
  border-radius: 2px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
`;

const ModalLayer: React.FC<{}> = ({ children }) => {
  return (
    <ModalLayerContainer>
      <ModalLayerFrame>{children}</ModalLayerFrame>
    </ModalLayerContainer>
  );
};

export default ModalLayer;
