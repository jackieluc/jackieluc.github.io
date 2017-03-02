// shorthand for $(document).ready(...)

var connectedUsers = [];
var nickname = "";

$(function() {

    var socket = io();

    $('form').submit(function() {
	    socket.emit('chat', $('#m').val());
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
       $('#users').append($('<li>').text(user.usernickname));
    });

    socket.on('connected-users', function(users) {
        connectedUsers = users;
        connectedUsers.forEach(function(user, index, connectedUsers) {
            $('#users').append($('<li>').text(user.usernickname));
        });
    });
});
