/**
 * Author: Jackie Luc
 */

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

    let id = socket.id;
    let nickname = getUniqueNickname();
    connectedUsers.push({id : id, nickname : nickname});

    console.log("User connected - socket id: " + id + ", nickname: " + nickname);

    // send the connected user their username
    socket.emit('nickname', nickname);

    // broadcast the new connected user to all other connected users
    socket.broadcast.emit('new-user', { id : id, nickname : nickname });

    // send the connected user all the connected users
    socket.emit('connected-users', connectedUsers);

    // listen to 'chat' messages
    socket.on('chat', function(chatData){
        moment.locale();
        let entireMsg = "[" + moment().format('LT') + "] " + nickname + ": " + chatData.msg;
	    io.emit('chat', { nickname : nickname, msg : entireMsg });

        // send bold message to the user that sent the message
        // socket.emit('chat', boldMsg);

        // send the message to all other connected users
        // socket.broadcast.emit('chat', entireMsg);
    });

    // listen to 'change nickname' messages
    socket.on('change-nickname', function(msg) {
        let newNickname = msg.substring(6);
        let success = updateNickname(id, msg);

        // update all connected users with the new nickname
        if(success) {
            // change nickname for the user
            nickname = newNickname;
            socket.emit('nickname', nickname);

            // send new list of connected users to everyone
            io.emit('connected-users', connectedUsers);
        }
        else
            socket.emit('error-changing-nickname', newNickname);
    });

    // listen to 'disconnect' messages
    // TODO: USE COOKIES TO KEEP THEIR USERNAME IF THEY DISCONNECT
    socket.on('disconnect', function() {
        connectedUsers = connectedUsers.filter(function (user) {
            return user.nickname !== this.nickname;
        });

        // TODO: remove the user from online list on the client side
        io.emit('disconnect', nickname);
    });
});

/**
 * @returns {string} a unique nickname
 */
function getUniqueNickname() {
    return "anonymous" + ++anonymousNum;
}

/**
 * helper function that checks if a user currently has the requested username
 * @param newNickname
 * @returns {boolean}
 */
function checkDuplicate(newNickname) {
    // NOTE: used traditional for-loop because you cannot break out of a forEach loop
    for(let i = 0; i < connectedUsers.length; i++) {
        if (connectedUsers[i].nickname === newNickname)
            return true;
    }

    return false;
}

/**
 * helper function that replaces the current user's nickname with a new nickname
 * @param id
 * @param newNickname
 */
function replaceNickname(id, newNickname) {
    connectedUsers.forEach(function(user) {
        if (user.id === id)
            user.nickname = newNickname;
    });
}

/**
 *
 * @param msg
 * @returns {boolean}
 */
function updateNickname(id, msg) {

    // the msg contains a command to change color or nickname
    if (msg.startsWith("/nickcolor ")) {
        var newColor = msg.substring(10);
        // TODO: change the color of the msg
    }
    else if (msg.startsWith("/nick ")) {

        let newNickname = msg.substring(6);
        let duplicate = checkDuplicate(newNickname);

        if(duplicate)
            return false;
        else
            replaceNickname(id, newNickname);
    }

    return true;
};