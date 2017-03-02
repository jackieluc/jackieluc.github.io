// shorthand for $(document).ready(...)

var connectedUsers = {};
var nickname = "";

$(function() {

    var socket = io();

    $('form').submit(function() {
	    socket.emit('chat', $('#m').val());
	    $('#m').val('');
	    return false;
    });

    socket.on('nickname', function(nickname) {
        $('#nickname').append($('<h3>').text("You are: " + nickname));
    });

    socket.on('chat', function(msg) {
	    $('#messages').append($('<li>').text(msg));
    });
});
