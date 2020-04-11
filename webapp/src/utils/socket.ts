import { Socket } from 'phoenix';

const socket = new Socket('/socket');

socket.connect();

export default socket;
