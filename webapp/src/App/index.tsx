import { hot } from 'react-hot-loader/root';
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
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

  const [visible, setVisible] = useState(false);
  const { user, userList, channel, join } = useChannel();

  useEffect(() => {
    if (!roomId || !user) {
      setVisible(true);
      return;
    }
    setVisible(false);
  }, [roomId, user]);

  const handleCreate: EntranceModalProps['onCreate'] = (name) =>
    RoomAPI.create().then((roomId) => {
      setVisible(false);

      const params = new URLSearchParams(location.search);
      params.set('room', `${roomId}`);
      history.replaceState(null, null, `/?${params}`);

      join({ token: Global.getToken(), userName: name, roomId: `${roomId}` });
    });

  const handleJoin: EntranceModalProps['onJoin'] = (name) => {
    setVisible(false);
    join({ token: Global.getToken(), userName: name, roomId });
  };

  const filteredUserList = useMemo(
    () => userList?.filter((otherUser) => otherUser.id !== user?.id) || [],
    [user, userList]
  );

  return (
    <MainLayout>
      <ToolbarLayout>
        <ul>
          {userList.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      </ToolbarLayout>

      <EditorLayout>
        <EditorArea user={user} userList={filteredUserList} channel={channel} />
      </EditorLayout>

      <ConsoleLayout></ConsoleLayout>

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
