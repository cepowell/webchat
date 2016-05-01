// This is the JS file that is executed when a user joins the group chatroom.

// Connect to the socket. 
var socket = io();

// Submits new messages
function submitfunction(){
    var from = $('#user').val();
    var message = $('#m').val();
    if(message != '') {
	socket.emit('chatMessage', from, message);
    }
    $('#m').val('').focus();
    return false;
}
 
// Displays new messages to the chat room and colors them according to who is sending the message (you or another user)
socket.on('chatMessage', function(from, msg){
    var me = $('#user').val();
    var color = (from == me) ? 'green' : '#009afd';
    var from = (from == me) ? 'Me' : from;
    $('#messages').append('<li><b style="color:' + color + '">' + from + '</b>: ' + msg + '</li>');
});
 
// Alert all users in the room when a user enters the room
$(document).ready(function(){
    var name = makeid();
    $('#user').val(name);
    socket.emit('chatMessage', 'System', '<b>' + name + '</b> has joined the discussion');
});

// Alert all users in the room when a user leaves the room
$(window).unload(function(){
    var name = $('#user').val();
    socket.emit('chatMessage', 'System', '<b>' + name + '</b> has left the discussion');
});
 
// Create a random ID for each new user
function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
 
    for( var i=0; i < 5; i++ ) {
	text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// Submit message on enter even in a textarea
$("#m").keypress(function (e) {
    if(e.which == 13 && !e.shiftKey) {        
        $(this).closest("form").submit();
        e.preventDefault();
        return false;
    }
});
