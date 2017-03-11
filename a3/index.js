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
var disconnectedUsers = [];
var anonymousNum = 0;
var chatLog = [];

io.on('connection', function(socket){

    // initialize default values
    let nickname = "";
    let color = "#000000";
    let cookie = socket.request.headers.cookie;
    let user = { nickname : nickname, color: color };

    // parses the cookie to retrieve nickname if it exists
    let tempName = parseCookie(cookie);

    // check the disconnected users array to find if a nickname matches
    let exists = existsDisconnectedUsers({ nickname: tempName, color: color });

    // if we found a returning user, we give them their old information
    // else they get new information unique
    if (exists) {
        nickname = tempName;
        color = getColor(nickname);
        user.nickname = nickname;
        user.color = getColor(nickname);
    }
    else {
        nickname = getUniqueNickname();
        user.nickname = nickname;
    }

    // store values in array
    connectedUsers.push(user);

    // DEBUG MESSAGE //
    console.log("User connected - socket id: " + socket.id + ", nickname: " + nickname + ", color: " + color + ", cookie: " + cookie);

    // send the connected user their username
    socket.emit('nickname', user);

    // send the connected user all the connected users
    socket.emit('connected-users', connectedUsers);

    // send the connected user the last 200 messages in the chat
    socket.emit('chat-log', chatLog);

    // broadcast the new connected user to all other connected users
    socket.broadcast.emit('new-user', user);

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
            nickname = newNickname
            user.nickname = nickname;
            // send the new nickname to the user
            socket.emit('nickname', user);

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
        user.color = color;
        changeColor(nickname, color);
        socket.emit('change-color', user);
    });

    // listen to 'disconnect' messages
    socket.on('disconnect', function() {
        for (let i = 0; i < connectedUsers.length; i++) {
            if (connectedUsers[i].nickname == nickname) {

                //store the info for if the user returns
                disconnectedUsers.push(connectedUsers[i]);

                // remove from connected users array
                connectedUsers.splice(i, 1);
            }
        }

        io.emit('connected-users', connectedUsers);
    });
});

function getUniqueNickname() {
    return "anonymous" + ++anonymousNum;
}

/**
 * helper function that checks if a user currently has the requested username
 * @param newNickname
 * @returns {boolean}
 */
function checkDuplicate(newNickname) {
    let exists = false;

    for(let i = 0; i < connectedUsers.length; i++) {
        if (connectedUsers[i].nickname == newNickname) {
            exists = true;
            break;
        }
    }
    if (!exists) {
        for (let i = 0; i < disconnectedUsers.length; i++) {
            if (disconnectedUsers[i].nickname == newNickname)
                exists = true;
        }
    }

    return exists;
}

/**
 * helper function that replaces the current user's nickname with a new nickname
 * @param id
 * @param newNickname
 */
function replaceNickname(oldNickname, newNickname) {
    for (let i = 0; i < connectedUsers.length; i++) {
        if (connectedUsers[i].nickname == oldNickname) {
            connectedUsers[i].nickname = newNickname;
            break;
        }
    }
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

/**
 * helper function that checks if the nickname from the cookie is
 * from a client that has been disconnected
 * @param user
 * @returns {boolean}
 */
function existsDisconnectedUsers(user) {
    for (let i = 0; i < disconnectedUsers.length; i++) {
        if (disconnectedUsers[i].nickname == user.nickname)
            return true;
    }
    return false;
}

/**
 * parses the cookie to find the nickname stored
 * LARGELY INSPIRED BY: https://www.w3schools.com/js/js_cookies.asp
 * @param cookie
 * @returns {*}
 */
function parseCookie(cookie) {
    if (cookie === undefined)
        return "";

    let split = cookie.split(';');
    for (let i = 0; i < split.length; i++) {
        let c = split[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf("nickname=") == 0) {
            return c.substring("nickname=".length);
        }
    }
}

/**
 * gets the associated color with the nickname from a
 * disconnected user
 * @param nick
 * @returns {string|*|string}
 */
function getColor(nick) {
    for (let i = 0; i < disconnectedUsers.length; i++) {
        if (disconnectedUsers[i].nickname == nick)
            return disconnectedUsers[i].color;
    }
}
