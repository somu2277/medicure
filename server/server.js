require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('join_user_room', (userId) => {
        socket.join('user_' + userId);
    });
    
    socket.on('join_admin_room', () => {
        socket.join('admin_room');
    });

    // WebRTC Signaling
    socket.on('join-room', (roomId, userId) => {
        console.log(`User joining room: ${roomId}`);
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });

    socket.on('offer', (payload) => {
        io.to(payload.target).emit('offer', payload);
    });

    socket.on('answer', (payload) => {
        io.to(payload.target).emit('answer', payload);
    });

    socket.on('ice-candidate', (incoming) => {
        io.to(incoming.target).emit('ice-candidate', incoming.candidate);
    });
    
    socket.on('end-call', (roomId) => {
        socket.to(roomId).emit('call-ended');
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

app.set('io', io);

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running in mode on port ${PORT}`);
    });
});
