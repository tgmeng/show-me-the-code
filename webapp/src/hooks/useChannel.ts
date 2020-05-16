import { useCallback, useMemo, useState, useEffect } from 'react';
import { Socket, Presence, Channel } from 'phoenix';
import { useImmer } from 'use-immer';

import { ChannelEventType } from '@/constants/channel-event-type';

import { ChannelSelectionPayload } from '@/typings';

import { createChannelPayload } from '@/utils';

import UserModel, { User } from '@/models/user';

export default function useChannel() {
  const [user, setUser] = useState<User | null>(null);
  const [channel, setChannel] = useState<Channel>(null);
  const [presence, setPresence] = useState<Presence>(null);
  const [userList, updateUserList] = useImmer<User[]>([]);

  const join = useCallback(
    ({
      token,
      roomId,
      userName,
    }: {
      token: string;
      roomId: string;
      userName: string;
    }) => {
      const socket = new Socket('/socket', {
        params: {
          token,
        },
      });

      socket.connect();

      const localChannel = socket.channel(`room:${roomId}`, {
        user_name: userName,
      });

      localChannel
        .join()
        .receive('ok', (resp) => {
          const localUser = UserModel.create({
            id: resp.user_id,
            name: resp.user_name,
            color: resp.color,
          });

          setUser(localUser);

          const localPresence = new Presence(localChannel);
          setPresence(localPresence);

          localChannel.push(
            ChannelEventType.SyncRequest,
            createChannelPayload(undefined)
          );
        })
        .receive('error', (resp) => {
          console.log('unable to join', resp);
        });

      setChannel(localChannel);
    },
    []
  );

  useEffect(() => {
    if (!channel || !user) {
      return;
    }

    const eventOffList = [
      {
        type: ChannelEventType.Selection,
        callback: (e: ChannelSelectionPayload) => {
          const otherUserIndex = userList.findIndex(
            (otherUser) => otherUser.id === e.body.userId
          );

          if (otherUserIndex !== -1) {
            updateUserList((localUserList) => {
              // eslint-disable-next-line no-param-reassign
              localUserList[otherUserIndex] = UserModel.update(
                localUserList[otherUserIndex],
                { ...e.body }
              );
            });
          }
        },
      },
    ].map(({ type, callback }) => ({
      type,
      id: channel.on(type, callback),
    }));

    // eslint-disable-next-line consistent-return
    return () => {
      eventOffList.forEach(({ type, id }) => channel.off(type, id));
    };
  }, [channel, user, userList]);

  useEffect(() => {
    if (!presence) {
      return;
    }

    presence.onSync(() => {
      const neoList: User[] = [];
      presence.list((id, { metas: [first] }) => {
        neoList.push(
          UserModel.create({
            id,
            name: first.user_name,
            color: first.color,
          })
        );
      });
      updateUserList(() => neoList);
    });

    // eslint-disable-next-line consistent-return
    return () => {
      presence.onSync(null);
    };
  }, [presence, user]);

  const leave = useCallback(() => {
    [
      ChannelEventType.Edit,
      ChannelEventType.Sync,
      ChannelEventType.Selection,
    ].forEach((type) => channel.off(type));

    channel.leave().receive('ok', () => {
      setChannel(null);
      setPresence(null);
    });
  }, []);

  return useMemo(
    () => ({
      user,
      userList,
      channel,
      presence,
      join,
      leave,
    }),
    [userList, channel, presence, join, leave]
  );
}
