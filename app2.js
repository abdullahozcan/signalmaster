// Based on the tutorial:

var app = require('http').createServer(handler),
	io = require('socket.io').listen(app),
	nstatic = require('node-static'); // for serving files

// This will make all the files in the current folder
// accessible from the web
var fileServer = new nstatic.Server('./');
	
// This is the port for our web server.
// you will need to go to http://localhost:3000 to see it
var port = process.env.PORT || 8741; // Cloud9 + Heroku || localhost
app.listen(port);

// If the URL of the socket server is opened in a browser
function handler (request, response) {
	request.addListener('end', function () {
        fileServer.serve(request, response);
    });
}

// Delete this row if you want to see debug messages
//io.set('log level', 1);

// Heroku doesn't support websockets so...
// Detect if heroku via config vars
// https://devcenter.heroku.com/articles/config-vars
// heroku config:add HEROKU=true --app node-drawing-game
if (process.env.HEROKU === 'true') {
    io.configure(function () {
        io.set("transports", ["xhr-polling"]);
        io.set("polling duration", 20);
    });
}

function describeRoom(name) {
    var clients = io.sockets.clients(name);
    var result = {
        clients: {}
    };
    clients.forEach(function (client) {
        result.clients[client.id] = client.resources;
    });
    return result;
}
function safeCb(cb) {
    if (typeof cb === 'function') {
        return cb;
    } else {
        return function () {};
    }
}
// Listen for incoming connections from clients
io.sockets.on('connection', function (socket) {
  console.log('connessione effettuata');									  
socket.resources = {
        screen: false,
        video: false,
        audio: true
    };
	
	socket.on('join', join);

    function removeFeed(type) {
        io.sockets.in(socket.room).emit('remove', {
            id: socket.id,
            type: type
        });
    }
	
	function join(name, cb) {
        // sanity check
        if (typeof name !== 'string') return;
        // leave any existing rooms
        if (socket.room) removeFeed();
        safeCb(cb)(null, describeRoom(name))
        socket.join(name);
        socket.room = name;
    }
	
socket.on('message', function (data) {
       socket.broadcast.emit('message', data);
	 console.log('inviato messaggio');
    });


	
});