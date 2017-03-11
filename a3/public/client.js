/**
 * Author: Jackie Luc
 */

var connectedUsers = [];
var nickname = "";
var color = "";

$(function() {

    var socket = io();

    $('form').submit(function() {

        let msg = $('#m').val();

        // it is a command to change nickname or color (cutting off the command)
        // else it is a regular message
        if(changeNickname(msg))
            socket.emit('change-nickname', msg.substring(6));
        else if (changeColor(msg))
            socket.emit('change-color', msg.substring(11, 17));
        else
	        socket.emit('chat', { nickname : nickname, msg : msg });

	    $('#m').val('');
	    return false;
    });

    socket.on('nickname', function(user) {
        nickname = user.nickname;
        $('#nickname').text("You are: " + nickname);

        // update cookie
        document.cookie = "nickname=" + nickname + ";color=" + user.color + ";max-age=" + 60*5*1000 + ";";
    });

    socket.on('chat-log', function(chatLog) {
        updateChat(chatLog);

        // if there is overflow, scroll to the bottom of the chat box
        $('#chat').scrollTop($('#messages')[0].scrollHeight);
    });

    socket.on('chat', function(chatData) {
        addToChat(chatData);

        // if there is overflow, scroll to the bottom of the chat box
        $('#chat').scrollTop($('#messages')[0].scrollHeight);
    });

    socket.on('new-user', function(user) {
       connectedUsers.push(user);
       $('#users').append($('<li>').text(user.nickname));

        // if there is overflow, scroll to the bottom of the online user list
        $('#online-users').scrollTop($('#users')[0].scrollHeight);
    });

    socket.on('connected-users', function(users) {
        updateOnlineUsers(users);

        // if there is overflow, scroll to the bottom of the online user list
        $('#online-users').scrollTop($('#users')[0].scrollHeight);
    });

    socket.on('error-changing-nickname', function(newNickname) {
        $('#messages').append($('<li>').html("<span style=\"color: red\">Sorry, someone already has the nickname \"" + newNickname + "\"</span>"));

        // if there is overflow, scroll to the bottom of the chat box
        $('#chat').scrollTop($('#messages')[0].scrollHeight);
    });

    socket.on('change-color', function(user) {
        color = user.color;
        $('#messages').append($('<li>').html("<span style=\"color: " + color + "\">Your nickname color has been changed."));

        // if there is overflow, scroll to the bottom of the chat box
        $('#chat').scrollTop($('#messages')[0].scrollHeight);

        // update cookie
        document.cookie = "nickname=" + nickname + ";color=" + user.color + ";max-age=" + 60*5*1000 + ";";
    });
});

/**
 *
 * @param msg
 * @returns {boolean}
 */
function changeNickname(msg) {

    // if the command does not exist in the message, return false
    if (msg.startsWith("/nick "))
        return true;

    return false;
};

/**
 *
 * @param msg
 * @returns {boolean}
 */
function changeColor(msg) {

    // if the command does not exist in the message, return false
    if (msg.startsWith("/nickcolor "))
        return true;

    return false;
};

/**
 *
 * @param users
 */
function updateOnlineUsers(users) {
    connectedUsers = users;

    // clear current list
    $('#users').empty();

    // update the current list
    connectedUsers.forEach(function (user) {
        $('#users').append($('<li>').text(user.nickname));
    });
};

/**
 * helper function that converts chata data into a message and displays it
 * @param chatData
 */
function addToChat(chatData) {
    let time = chatData.time;
    let nick = chatData.nickname;
    let color = chatData.color;
    let msg = chatData.msg;
    let list = '<li>';

    // if this is the same user who sent the message, bold it
    if (nickname === nick)
        list = '<li class="sentMessages">';

    $('#messages').append($(list).html("[" + time + "] <span style=\"color:" + color + "\">" + nick + "</span>: " + msg));
}

/**
 * helper function that displays the previous chat log
 * @param chatLog
 */
function updateChat(chatLog) {
    chatLog.forEach(function (chatData) {
        addToChat(chatData);
    });
}
