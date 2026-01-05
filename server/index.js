const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const words = require('./words');
const { createRoom, joinRoom, getRoom, removePlayer, startGame, submitSentence, votePlayer, restartGame } = require('./gameStore');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            process.env.CLIENT_URL // Allow deployed client URL
        ],
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create_room', ({ name }) => {
        const room = createRoom(socket.id, name);
        socket.join(room.code);
        socket.emit('room_joined', room);
        console.log(`Room created: ${room.code} by ${name}`);
    });

    socket.on('join_room', ({ code, name }) => {
        const room = joinRoom(code, socket.id, name);
        if (!room) {
            socket.emit('error', { message: "Room not found" });
        } else if (room.error) {
            socket.emit('error', { message: room.error });
        } else {
            socket.join(code);
            io.to(code).emit('room_update', room); // Broadcast to everyone in room
            socket.emit('room_joined', room); // Send to joiner (redundant but safe)
        }
    });

    socket.on('start_game', ({ code }) => {
        const room = startGame(code, words);
        if (room) {
            io.to(code).emit('room_update', room);
        }
    });

    socket.on('submit_sentence', ({ code, sentence }) => {
        const room = submitSentence(code, socket.id, sentence);
        if (room) {
            io.to(code).emit('room_update', room);
        }
    });

    socket.on('vote_player', ({ code, targetId }) => {
        const room = votePlayer(code, socket.id, targetId);
        if (room) {
            io.to(code).emit('room_update', room);
        }
    });

    socket.on('restart_game', ({ code }) => {
        const room = restartGame(code);
        if (room) {
            io.to(code).emit('room_update', room);
        }
    });

    socket.on('disconnect', () => {
        const room = removePlayer(socket.id);
        if (room) {
            io.to(room.code).emit('room_update', room);
        }
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
