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
    let color = "#000000";
    connectedUsers.push({ id : id, nickname : nickname, color: color });

    console.log("User connected - socket id: " + id + ", nickname: " + nickname + ", color: " + color);

    // send the connected user their username
    socket.emit('nickname', nickname);

    // broadcast the new connected user to all other connected users
    socket.broadcast.emit('new-user', { id : id, nickname : nickname });

    // send the connected user all the connected users
    socket.emit('connected-users', connectedUsers);

    // listen to 'chat' messages
    socket.on('chat', function(chatData){
        moment.locale();
	    io.emit('chat', { time: moment().format('LT'), nickname : nickname, color: color, msg : chatData.msg });
    });

    // listen to 'change nickname' commands
    socket.on('change-nickname', function(msg) {
        let newNickname = msg;
        let success = changeNickname(id, newNickname);

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

    // listen to 'change color' commands
    socket.on('change-color', function(msg) {
        let newColor = "#" + msg;
        color = newColor;
        changeColor(id, newColor);
        socket.emit('change-color', newColor);
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
 * @param id
 * @param newNickname
 * @returns {boolean}
 */
function changeNickname(id, newNickname) {
    let duplicate = checkDuplicate(newNickname);

    if(duplicate)
        return false;
    else
        replaceNickname(id, newNickname);

    return true;
};

/**
 *
 * @param id
 * @param newNickname
 */
function changeColor(id, newColor) {
    for(let i = 0; i < connectedUsers.length; i++) {
        if (connectedUsers[i].id === id) {
            connectedUsers[i].color = newColor;
            break;
        }
    }
};