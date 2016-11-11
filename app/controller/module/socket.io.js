module.exports = exports = (server, config)=> {
    var io = require('socket.io').listen(server);
    io.sockets.on('connection', (client) => {
        console.log('socket.io connected');

        client.on('message', function (message) {
            console.log(message);
            client.send('response');
        });

        client.on('disconnect', function () {
        });
    });

    return {}; // returns to express request object
};