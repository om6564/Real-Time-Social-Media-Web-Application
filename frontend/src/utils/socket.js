import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;

export const initializeSocket = (userId) => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            auth: {
                token: localStorage.getItem('token'),
            },
        });

        socket.on('connect', () => {
            console.log('Socket connected');
            socket.emit('join', userId);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    }

    return socket;
};

export const getSocket = () => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
