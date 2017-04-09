const fs = require('fs');
const https = require('https');
const sio = require('socket.io');

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};


let app = https.createServer(options, (request, response) => {
    response.writeHead(200);
    response.end('nothing to see here');
});
let io = new sio(app);

let users = {};

io.on('connection', socket => {
    console.log('new connection', socket.id);
    console.log('io', Object.keys(io));
    console.log('io.sockets', Object.keys(io.sockets));
    console.log('io.sockets.name', io.sockets.name);
    console.log('io.sockets.events', io.sockets.events);
    console.log('io.sockets.sockets', Object.keys(io.sockets.sockets));

    users[socket.id] = {username: 'anonymous'};

    // socket.emit('users', users);
    // socket.broadcast.emit('users', users);
    io.sockets.emit('users', users);

    socket.on('message', data => {
        console.log('message', data);

        if (data.id && data.value) 
            socket.to(data.id).send({from: socket.id, value: data.value});
    });

    socket.on('username', username => {
        // console.log('username:', socket.id, username)

        users[socket.id].username = username;
        io.sockets.emit('users', users);
    });

    socket.on('disconnect', reason => {
        console.log('disconnect', reason);
    });

    socket.on('disconnecting', reason => {
        console.log('disconnecting', reason);

        delete users[socket.id];
        io.sockets.emit('users', users);
    });

    socket.on('error', error => {
        console.log('error', error);
    });
});

app.listen(8080);
