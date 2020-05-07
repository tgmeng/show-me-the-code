import { User } from '@/models/user';

export function createChannelPayload<T>({ user, body }: { user: User; body: T }) {
  return {
    user: { id: user.id },
    body,
  };
}
