var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var moment = require('moment');

http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));

var connectedUsers = [];
var anonymousNum = 0;

io.on('connection', function(socket){

    var id = socket.id;
    var nickname = getRandomNickname();
    connectedUsers.push({userid: id, usernickname: nickname});

    console.log("User connected - socket id: " + id + ", nickname: " + nickname);

    // send the connected user their username
    socket.emit('nickname', nickname);

    // broadcast the new connected user to all other online users
    socket.broadcast.emit('new-user', {userid: id, usernickname: nickname});

    // send the connected users to all connected user
    socket.emit('connected-users', connectedUsers);

    // listen to 'chat' messages
    socket.on('chat', function(msg){
        moment.locale();
        var entireMsg = "[" + moment().format('LT') + "] " + nickname + ": " + msg;
	    io.emit('chat', entireMsg);
    });

    // listen to 'disconnect' messages
    // TODO: USE COOKIES TO KEEP THEIR USERNAME IF THEY DISCONNECT
    socket.on('disconnect', function() {
        connectedUsers = connectedUsers.filter(function (user) {
            return user.usernickname !== this.nickname;
        });

        // TODO: remove the user from online list on the client side
        io.emit('disconnect', nickname);
    });
});

/**
 * @returns {string} a unique nickname
 */
function getRandomNickname() {
    return "anonymous" + ++anonymousNum;
}
