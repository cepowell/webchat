var socket = io();

function submitfunction(){
    var from = $('#user').val();
    var message = $('#m').val();
    if(message != '') {
	socket.emit('chatMessage', from, message);
    }
    $('#m').val('').focus();
    return false;
}
 
socket.on('chatMessage', function(from, msg){
    var me = $('#user').val();
    var color = (from == me) ? 'green' : '#009afd';
    var from = (from == me) ? 'Me' : from;
    $('#messages').append('<li><b style="color:' + color + '">' + from + '</b>: ' + msg + '</li>');
});
 
$(document).ready(function(){
    var name = makeid();
    $('#user').val(name);
    socket.emit('chatMessage', 'System', '<b>' + name + '</b> has joined the discussion');
});
 
function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
 
    for( var i=0; i < 5; i++ ) {
	text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
