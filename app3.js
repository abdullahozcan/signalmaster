// 2013, Muaz Khan - https://github.com/muaz-khan
// MIT License     - https://www.webrtc-experiment.com/licence/
// Documentation   - https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs

var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);
	
	var port = process.env.PORT || 8741; // Cloud9 + Heroku || localhost

server.listen(port);

if (process.env.HEROKU === 'true') {
    io.configure(function () {
        io.set("transports", ["xhr-polling"]);
        io.set("polling duration", 16);
    });
}

// ----------------------------------socket.io

var channels = {};

io.sockets.on('connection', function (socket) {
//	console.log ('utente connesso ');								  
    var initiatorChannel = '';
    if (!io.isConnected)
        io.isConnected = true;

    socket.on('new-channel', function (data) {
        channels[data.channel] = data.channel;
        onNewNamespace(data.channel, data.sender);
	     });

    socket.on('presence', function (channel) {
        var isChannelPresent = !! channels[channel];
        socket.emit('presence', isChannelPresent);
	//	console.log(isChannelPresent + 'rthrhwrthrw34642');
        if (!isChannelPresent)
            initiatorChannel = channel;
    });

    socket.on('disconnect', function (channel) {
        if (initiatorChannel)
            channels[initiatorChannel] = null;
    });
});

function onNewNamespace(channel, sender) {
    io.of('/' + channel).on('connection', function (socket) {
        if (io.isConnected) {
            io.isConnected = false;
            socket.emit('connect', true);
        }

        socket.on('message', function (data) {
            if (data.sender == sender)
                socket.broadcast.emit('message', data.data);
				
        });
    });
}

// ----------------------------------extras

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/RTCMultiConnection.html');
});

app.get('/socketio.js', function (req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendfile(__dirname + '/socket.io.js');
});


app.get('/RTCMultiConnection-v1.4.js', function (req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendfile(__dirname + '/RTCMultiConnection-v1.4.js');
});




app.get('/audio', function (req, res) {
        res.sendfile(__dirname + '/audio/index.html');
});

app.get('/../socketio.js', function (req, res) {
 res.setHeader('Content-Type', 'application/javascript');
   res.sendfile(__dirname + '/socket.io.js');
});


app.get('/simplewebrtcbundle2.js', function (req, res) {
 res.setHeader('Content-Type', 'application/javascript');
   res.sendfile(__dirname + '/audio/simplewebrtcbundle2.js');
});

