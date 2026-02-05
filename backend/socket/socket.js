import { Server } from 'socket.io';

let io;

// Map to store user socket connections
const userSockets = new Map();

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // User joins with their userId
        socket.on('join', (userId) => {
            console.log(`User ${userId} joined with socket ${socket.id}`);
            userSockets.set(userId, socket.id);
            socket.join(userId);
        });

        // User disconnects
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            // Remove from userSockets map
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    break;
                }
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

export const getUserSocket = (userId) => {
    return userSockets.get(userId);
};
