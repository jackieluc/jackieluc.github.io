// shorthand for $(document).ready(...)

var connectedUsers = [];
var nickname = "";


/**
 *
 * @param msg
 * @returns {boolean}
 */
function checkCommand(msg) {

    // if the command does not exist in the message, return false
    if (msg.startsWith("/nick ") || msg.startsWith("/nickcolor "))
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

        var msg = $('#m').val();

        // it is a command to change nickname or color
        // else it is a regular message
        if(checkCommand(msg))
            socket.emit('change-nickname', msg);
        else
	        socket.emit('chat', msg);

	    $('#m').val('');
	    return false;
    });

    socket.on('nickname', function(nickname) {
        $('#nickname').text("You are: " + nickname);
    });

    socket.on('chat', function(msg) {
        $('#messages').append($('<li>').text(msg));

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
        // TODO: make this red
        let errorMsg = $('<li class="error">').text("Sorry, someone already has the nickname \"" + newNickname + "\"");
        errorMsg.style.color = "#FF0000";
        $('#messages').append(errorMsg);
        // $('.error').style.color = "#FF0000";
    });
});
