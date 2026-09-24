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
        origin: ['http://localhost:5173', 'http://localhost:5174'], // Customer & Admin
        methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // User joins their personal room
    socket.on('join_user_room', (userId) => {
        socket.join(`user_${userId}`);
    });
    
    // Admins join admin room
    socket.on('join_admin_room', () => {
        socket.join('admin_room');
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Make io accessible globally if needed, or pass to controllers via req
app.set('io', io);

// Connect to DB and start server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
});