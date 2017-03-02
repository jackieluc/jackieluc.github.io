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

// listen to 'chat' messages
io.on('connection', function(socket){

    // var address = socket.request.connection.remoteAddress;

    console.log(address + " connected!");

    socket.on('chat', function(msg){
        moment.locale();
	    io.emit('chat', moment().format('LT') + " " + msg);
    });
});
