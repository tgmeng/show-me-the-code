import { hot } from 'react-hot-loader/root';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useSearchParam } from 'react-use';

import Global from '@/App/global';

import RoomAPI from '@/apis/room';
import useChannel from '@/hooks/useChannel';

import {
  MainLayout,
  ToolbarLayout,
  EditorLayout,
  ConsoleLayout,
} from './components/Layout';

import EditorArea from './components/EditorArea';
import EntranceModal, { EntranceModalProps } from './components/EntranceModal';

function App() {
  const roomId = useSearchParam('room');

  const [webRTCActive, setWebRTCActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const {
    user,
    userList,
    editorRef,
    editorDidMountEffect,
    join,
  } = useChannel();

  const handleCreate: EntranceModalProps['onCreate'] = (name) =>
    RoomAPI.create().then((localRoomId) => {
      setVisible(false);

      const params = new URLSearchParams(window.location.search);
      params.set('room', `${localRoomId}`);
      window.history.replaceState(null, null, `/?${params}`);

      join({
        token: Global.getToken(),
        userName: name,
        roomId: `${localRoomId}`,
      });
    });

  const handleJoin: EntranceModalProps['onJoin'] = (name) => {
    setVisible(false);
    join({ token: Global.getToken(), userName: name, roomId });
  };

  useEffect(() => {
    if (!roomId || !user) {
      setVisible(true);
      return;
    }
    setVisible(false);
  }, [roomId, user]);

  useEffect(() => {}, [webRTCActive]);

  return (
    <MainLayout>
      <ToolbarLayout>
        <ul style={{ display: 'inline-block' }}>
          {userList.map((localUser) => (
            <li key={localUser.id}>{localUser.name}</li>
          ))}
        </ul>
        <button type="button" onClick={() => setWebRTCActive(!webRTCActive)}>
          {webRTCActive ? '关闭' : '打开'}视频
        </button>
      </ToolbarLayout>

      <EditorLayout>
        <EditorArea
          editorRef={editorRef}
          editorDidMountEffect={editorDidMountEffect}
        />
      </EditorLayout>

      <ConsoleLayout />

      <EntranceModal
        roomId={roomId}
        visible={visible}
        onCreate={handleCreate}
        onJoin={handleJoin}
      />
    </MainLayout>
  );
}

export default hot(App);
