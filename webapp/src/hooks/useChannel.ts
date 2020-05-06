import { useCallback, useMemo, useState, useEffect } from 'react';
import { Socket, Presence, Channel } from 'phoenix';
import { useImmer } from 'use-immer';

import { ChannelEventType } from '@/constants/channel-event-type';

import UserModel, { User } from '@/models/user';
import { ChannelSelectionPayload, ChannelPayload } from '@/typings';

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

      let channel = socket.channel(`room:${roomId}`, {
        user_name: userName,
      });

      channel
        .join()
        .receive('ok', (resp) => {
          setUser(
            UserModel.create({
              id: resp.user_id,
              name: resp.user_name,
            })
          );

          const presence = new Presence(channel);
          setPresence(presence);
        })
        .receive('error', (resp) => {
          console.log('unable to join', resp);
        });

      setChannel(channel);
    },
    []
  );

  useEffect(() => {
    if (!channel || !user) {
      return;
    }

    const eventOffList = [
      {
        type: ChannelEventType.Edit,
        callback: (e) => {
          if (e.user.id === user.id) {
            return;
          }
        },
      },
      {
        type: ChannelEventType.Sync,
        callback: (e) => {
          if (e.user.id === user.id) {
            return;
          }
          console.log(e);
        },
      },

      {
        type: ChannelEventType.Selection,
        callback: (e: ChannelSelectionPayload) => {
          if (e.user.id === user.id) {
            return;
          }

          const otherUserIndex = userList.findIndex(
            (otherUser) => otherUser.id === e.user.id
          );

          if (otherUserIndex !== -1) {
            updateUserList((userList) => {
              userList[otherUserIndex] = UserModel.update(
                userList[otherUserIndex],
                {
                  ...e.body,
                }
              );
            });
          }
        },
      },
    ].map(({ type, callback }) => ({
      type,
      id: channel.on(type, callback),
    }));

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
          })
        );
      });
      updateUserList(() => neoList);
    });

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
