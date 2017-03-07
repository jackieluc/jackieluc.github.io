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
var chatLog = [];

io.on('connection', function(socket){

    // initialize default values and store in array
    let nickname = getUniqueNickname();
    let color = "#000000";
    let cookie = getRandomCookie();
    connectedUsers.push({ nickname : nickname, color: color, cookie : cookie });

    console.log("User connected - socket id: " + socket.id + ", nickname: " + nickname + ", color: " + color + ", cookie: " + cookie);

    // send the connected user their username
    socket.emit('nickname', nickname);

    // send the connected user all the connected users
    socket.emit('connected-users', connectedUsers);

    // send the connected user the last 200 messages in the chat
    socket.emit('chat-log', chatLog);

    // send the connected user a unique cookie
    socket.emit('cookie', cookie);

    // broadcast the new connected user to all other connected users
    socket.broadcast.emit('new-user', { nickname : nickname });

    // listen to 'chat' messages
    socket.on('chat', function(chatData){
        moment.locale();
        let msgObject = { time : moment().format('LT'), nickname : chatData.nickname, color: color, msg : chatData.msg };
        // store in chat log and also send to all connected users
        updateChatLog(msgObject);
	    io.emit('chat', msgObject);
    });

    // listen to 'change nickname' commands
    socket.on('change-nickname', function(msg) {
        let newNickname = msg;
        let success = changeNickname(nickname, newNickname);

        // update all connected users with the new nickname
        if(success) {
            // change nickname for the user
            socket.emit('nickname', newNickname);

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
        changeColor(nickname, color);
        socket.emit('change-color', color);
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
 * some random number
 * @returns {number}
 */
function getRandomCookie() {
    return Math.random();
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
function replaceNickname(oldNickname, newNickname) {
    connectedUsers.forEach(function(user) {
        if (user.nickname === oldNickname) {
            user.nickname = newNickname;
            console.log("Changing old nickname: " + oldNickname + " to new nickname: " + user.nickname);
        }
    });
}

/**
 * helper function to change and replace the nickname
 * @param id
 * @param newNickname
 * @returns {boolean}
 */
function changeNickname(oldNickname, newNickname) {
    let duplicate = checkDuplicate(newNickname);

    if(duplicate)
        return false;
    else
        replaceNickname(oldNickname, newNickname);

    return true;
};

/**
 * helper function that changes the color in the connectedUsers array
 * @param id
 * @param newNickname
 */
function changeColor(nickname, newColor) {
    for(let i = 0; i < connectedUsers.length; i++) {
        if (connectedUsers[i].nickname === nickname) {
            connectedUsers[i].color = newColor;
            break;
        }
    }
};

/**
 * helper function that updates the chat log by removing the oldest message
 * and appends a new message if the chat log is full
 * @param msgObject
 */
function updateChatLog(msgObject) {
    chatLog.push(msgObject);

    // we remove the first element if the chat log is more than 200
    if (chatLog.length > 200) {
        chatLog.shift();
    }
}