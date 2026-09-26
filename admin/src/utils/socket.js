import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_SOCKET_URL || 'https://medicure-server-kzu6.onrender.com';
const socket = io(URL, { autoConnect: false });

export default socket;
