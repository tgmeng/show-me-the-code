import { createRequestAPIs } from '@/utils/request';

const RoomAPI = createRequestAPIs({
  create: {
    url: '/room/create',
    method: 'POST',
  },
});

export default RoomAPI;
