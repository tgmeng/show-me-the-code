import styled from '@emotion/styled';

export const ToolbarLayout = styled('header')`
  grid-area: toolbar;
`;

export const EditorLayout = styled('section')`
  grid-area: editor;
`;

export const ConsoleLayout = styled('section')`
  grid-area: console;
`;

export const MainLayout = styled('main')`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  display: grid;
  grid-template-columns: 1fr 30%;
  grid-template-rows: 60px 1fr;
  grid-template-areas:
    'toolbar toolbar'
    'editor console';
`;
