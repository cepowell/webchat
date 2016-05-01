// This file listens for events on the socket.

// req = request, res = response. For each function, req contains information about the HTTP request that triggered the event and res contains information about the HTTP response being send back

var gravatar = require('gravatar');

// module.exports is a Node.js construct that allows us to use all the code in this file in another file and call the functions defined here as though they were defined in the other file
module.exports = function(app, io){

    /* ROUTES */
    
    // Sets the home page (root route), whose view is defined in index.html
    app.get('/', function(req,res){
	res.render('index');
    });
    
    // Defines the create route, which creates a random id for a new chat room and redirects to the chat view
    app.get('/create', function(req,res){
	var id = Math.round((Math.random() * 1000000));
	res.redirect('/chat/'+id);
    });

    // Private chat route, whose view is defined in chat.html
    app.get('/chat/:id', function(req,res){
	res.render('chat');
    });
    
    // Group chat route, whose view is defined groupchat.html
    app.get('/groupchat', function(req, res){
	res.render('groupchat');
    });

    /* SOCKET APPLICATION */

    // Initialize a new socket.io application, named 'chat'
    var chat = io.on('connection', function (socket) {
	
	// Socket function for handling messages in the group chat room
	socket.on('chatMessage', function(from, msg){
	    io.emit('chatMessage', from, msg);
	});

	// When the socket is loaded, emit the number of people in the chat room
	socket.on('load',function(data){

	    var room = findClientsSocket(io,data);
	    if (room.length === 0 ) {
		socket.emit('peopleinchat', {number: 0});
	    }
	    else if(room.length === 1) {
		socket.emit('peopleinchat', {
		    number: 1,
		    user: room[0].username,
		    avatar: room[0].avatar,
		    id: data
		});
	    }
	    else if(room.length >= 2) {
		chat.emit('tooMany', {boolean: true});
	    }
	});

	// When a new user logs into the socket, save the user's information and log the user into the chat room
	socket.on('login', function(data) {
	    
	    var room = findClientsSocket(io, data.id);

	    if (room.length < 2) {

		// Use the socket object to store data. Each client gets their own unique socket object.
		socket.username = data.user;
		socket.room = data.id;

		// Add the client to the room
		socket.join(data.id);
		
		if (room.length == 1) {
		    var usernames = [], avatars = [];

		    usernames.push(room[0].username);			
		    usernames.push(socket.username);
		    avatars.push(room[0].avatar);
		    avatars.push(socket.avatar);
		    
		    // Send the startChat event to all the people in the room, along with a list of people that are in it.

		    chat.in(data.id).emit('startChat', {				
			boolean: true,
			id: data.id,
			users: usernames,
			avatars: avatars
		    });
		}
	    }
	    else {
		socket.emit('tooMany', {boolean: true});
	    }
	});

	// When a user disconnects from the socket, inform other chat room members and log the user out
	socket.on('disconnect', function() {
	    
	    socket.broadcast.to(this.room).emit('leave', {
		boolean: true,
		room: this.room,
		user: this.username,
		avatar: this.avatar
	    });
	    
	    socket.leave(socket.room);
	});

	// When a message comes through the socket, send the message to the other user in the chat room
	socket.on('msg', function(data){
	    
	    socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
	});
    });
};

function findClientsSocket(io,roomId, namespace) {
    var res = [], ns = io.of(namespace ||"/");    // the default namespace is "/"
    
    if (ns) {
	for (var id in ns.connected) {
	    if(roomId) {
		var index = ns.connected[id].rooms.indexOf(roomId) ;
		if(index !== -1) {
		    res.push(ns.connected[id]);
		}
	    }
	    else {
		res.push(ns.connected[id]);
	    }
	}
    }
    return res;
}
