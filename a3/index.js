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

var connectedUsers = {};
var anonymousNum = 0;

io.on('connection', function(socket){

    var id = socket.id;
    var nickname = getRandomNickname();
    connectedUsers[id] = nickname;

    console.log("User connected - socket id: " + id + ", nickname: " + nickname);

    // send the connected user their username
    // TODO: USE COOKIES TO KEEP THEIR USERNAME IF THEY DISCONNECT
    socket.emit('nickname', nickname);

    // broadcast the connected user to all other users
    // TODO: IMPLEMENT "SHOW ONLINE USERS"
    socket.broadcast.emit('connected-users', nickname);

    // listen to 'chat' messages
    socket.on('chat', function(msg){
        moment.locale();
	    io.emit('chat', "[" + moment().format('LT') + "] " + nickname + ": " + msg);
    });
});

/**
 * @returns {string} a unique nickname
 */
function getRandomNickname() {
    return "anonymous" + ++anonymousNum;
}
