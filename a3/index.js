/**
 * Author: Jackie Luc
 */

var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var moment = require('moment');
var cookieParser = require('cookie-parser');

http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.get('/', function(req, res) {
   // check existing cookies
    console.log("Cookies: " + req.cookies);

    // set new cookie for an hour
    res.cookie("gg", "bob", { maxAge: 60 * 60 * 1000 });

    //clear a cookie
    res.clearCookie("gg");
});

var connectedUsers = [];
var anonymousNum = 0;
var chatLog = [];

io.on('connection', function(socket){

    // initialize default values
    let nickname = getUniqueNickname();
    let color = "#000000";
    let cookie = createCookie(nickname, color);

    // store values in array
    connectedUsers.push({ nickname : nickname, color: color, cookie : cookie });

    console.log("User connected - socket id: " + socket.id + ", nickname: " + nickname + ", color: " + color + ", cookie: " + cookie);

    // send the connected user their username
    socket.emit('nickname', nickname);

    // send the connected user a unique cookie
    socket.emit('cookie', cookie);

    // socket.on('request-cookie', function(cookie) {
    //     let success = checkCookie(cookie);
    //
    //     // cookie has valid nickname
    //     if (success) {
    //
    //         console.log("connected: " + connectedUsers.length);
    //         for (let i = 0; i < connectedUsers.length; i++) {
    //             console.log("nickname: " + connectedUsers[i].nickname + " cookieName: " + getNicknameFromCookie(cookie));
    //             if (connectedUsers[i].nickname === getNicknameFromCookie(cookie)) {
    //                 console.log("connecteduser[i]: " + connectedUsers[i].nickname + " nick: " + getNicknameFromCookie(cookie) + " i: " + i);
    //
    //                 nickname = connectedUsers[i].nickname;
    //                 color = connectedUsers[i].color;
    //                 cookie = connectedUsers[i].cookie;
    //                 break;
    //             }
    //         }
    //
    //         console.log("Welcome back, " + nickname);
    //     }
    //     else {
    //
    //         // store values in array
    //         connectedUsers.push({ nickname : nickname, color: color, cookie : cookie });
    //
    //         console.log("User connected - socket id: " + socket.id + ", nickname: " + nickname + ", color: " + color + ", cookie: " + cookie);
    //     }
    //
    //     // send the connected user their username
    //     socket.emit('nickname', nickname);
    //
    //     // send the connected user a unique cookie
    //     socket.emit('cookie', cookie);
    // });

    // send the connected user all the connected users
    socket.emit('connected-users', connectedUsers);

    // send the connected user the last 200 messages in the chat
    socket.emit('chat-log', chatLog);

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
            // send the new nickname to the user
            socket.emit('nickname', newNickname);

            // send the updated cookie to the user
            socket.emit('cookie', getCookie(newNickname));

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
            return user.nickname !== nickname;
        });

        io.emit('connected-users', connectedUsers);
    });
});

/**
 * @returns {string} a unique nickname
 */
function getUniqueNickname() {
    return "anonymous" + ++anonymousNum;
}

/**
 * helper function that creates a cookie
 * @param nickname
 * @returns {string}
 */
function createCookie(nickname, color) {
    return "nickname=" + nickname + "; color=" + color + "; maxAge=" + 60 * 60;
}

/**
 * helper function that gets the cookie of a user
 * @param nickname
 * @returns {*|string}
 */
function getCookie(nickname) {
    // NOTE: used traditional for-loop because you cannot break out of a forEach loop
    for(let i = 0; i < connectedUsers.length; i++) {
        if(connectedUsers[i].nickname === nickname)
            return connectedUsers[i].cookie;
    }
    // if not found
    return null;
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

            // update the cookie
            user.cookie = createCookie(user.nickname, user.color);
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

function checkCookie(cookie) {
    let nick = getNicknameFromCookie(cookie);

    // not found in cookie
    if (nick === "")
        return false;

    return true;
}

function getNicknameFromCookie(cookie) {
    let deconstructed = cookie.split(';');
    // NOTE: used traditional for-loop because you cannot break out of a forEach loop
    for (let i = 0; i < deconstructed.length; i++) {
        if(deconstructed[i].startsWith("nickname="))
            console.log("deconstructed: " + deconstructed[i].substring(9));
            return deconstructed[i].substring(9);
    }
    return "";
}