/**
 * Author: Jackie Luc
 */

var connectedUsers = [];
var nickname = "";
var color = "";


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

$(function() {

    var socket = io();

    $('form').submit(function() {

        let msg = $('#m').val();

        // it is a command to change nickname or color (cutting off the command)
        // else it is a regular message
        if(changeNickname(msg))
            socket.emit('change-nickname', msg.substring(6));
        else if (changeColor(msg))
            socket.emit('change-color', msg.substring(11));
        else
	        socket.emit('chat', { msg : msg });

	    $('#m').val('');
	    return false;
    });

    socket.on('nickname', function(nickname) {
        this.nickname = nickname;
        $('#nickname').text("You are: " + nickname);
    });

    socket.on('chat', function(chatData) {
        let time = chatData.time;
        let nickname = chatData.nickname;
        let color = chatData.color;
        let msg = chatData.msg;
        let list = '<li>';

        // if this is the same user who sent the message, bold it
        if (this.nickname === nickname)
            list = '<li class="sentMessages">';

        $('#messages').append($(list).html("[" + time + "] <span style=\"color:" + color + "\">" + nickname + "</span>: " + msg));

        // TODO: FIX THIS SUCH THAT IT WILL ALIGN TO BOTTOM OF MESSAGES IN CHAT BOX FOR OVERFLOW
        // $('#test').scrollTop($('#messages')[0].scrollHeight);
    });

    socket.on('new-user', function(user) {
       connectedUsers.push(user);
       $('#users').append($('<li>').text(user.nickname));
    });

    socket.on('connected-users', function(users) {
        updateOnlineUsers(users);
    });

    socket.on('error-changing-nickname', function(newNickname) {
        $('#messages').append($('<li>').html("<span style=\"color: red\">Sorry, someone already has the nickname \"" + newNickname + "\"</span>"));
    });

    socket.on('change-color', function(color) {
        this.color = color;
        $('#messages').append($('<li>').html("<span style=\"color: " + color + "\">Your nickname color has been changed."));
    });
});
