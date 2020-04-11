import { hot } from 'react-hot-loader/root';
import * as React from 'react';
import { useState } from 'react';
import { Channel } from 'phoenix';
import styled from '@emotion/styled';

import socket from '@/utils/socket';
import EditorArea from './components/EditorArea';

const ToolbarLayout = styled('header')`
  grid-area: toolbar;
`;

const EditorLayout = styled('section')`
  grid-area: editor;
`;

const ConsoleLayout = styled('section')`
  grid-area: console;
`;

const MainLayout = styled('main')`
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

function App() {
  const [value, setValue] = useState('');
  const [list, setList] = useState([]);

  const channelRef = React.useRef(null);

  React.useEffect(() => {
    let channel = socket.channel('room:coding', {});

    channel.on('new_msg', (payload) => {
      setList((list) => [...list, `${payload.body}`]);
    });

    channel
      .join()
      .receive('ok', (resp) => {
        console.log('joined successfully', resp);
      })
      .receive('error', (resp) => {
        console.log('unable to join', resp);
      });

    channelRef.current = channel;
  }, []);

  return (
    <MainLayout>
      <ToolbarLayout>Test</ToolbarLayout>

      <EditorLayout>
        <EditorArea />
        {/* <input
        type="text"
        value={value}
        onKeyPress={(e) => {
          if (e.nativeEvent.keyCode === 13) {
            channelRef.current?.push('new_msg', { body: value });
            setValue('');
          }
        }}
        onChange={(e) => setValue(e.target.value)}
      /> */}
      </EditorLayout>

      <ConsoleLayout>
        <ul>
          {list.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </ConsoleLayout>
    </MainLayout>
  );
}

export default hot(App);
