const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const users = {}; // Store users by socket ID

io.on('connection', socket => {
    socket.on('join', () => {
        users[socket.id] = socket;
        matchUsers(socket);
    });

    socket.on('signal', data => {
        const targetSocket = users[data.to];
        if (targetSocket) {
            targetSocket.emit('signal', { signal: data.signal, from: socket.id });
        }
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
    });
});

function matchUsers(socket) {
    const userIds = Object.keys(users);
    for (let i = 0; i < userIds.length; i++) {
        if (userIds[i] !== socket.id) {
            const peerSocket = users[userIds[i]];
            socket.emit('match', { id: peerSocket.id });
            peerSocket.emit('match', { id: socket.id });
            break;
        }
    }
}

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
