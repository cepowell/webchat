/* This is the main file of the chat application. It initializes the express.js framework 
and requires that the app use the routes.js file, which sets up the website navigation.*/

// Importing (requiring, in node.js) the express.js module
var express = require('express');

// Creating an Express application
var app = express();

// Creating a port for running the app locally (8080) and allowing Heroku to create a port when the app is deployed (process.env.PORT)
var port = process.env.PORT || 8080;

// Initialize a new socket.io object by binding it to the Express server so it listens for messages on that server
var io = require('socket.io').listen(app.listen(port));

app.set('view engine', 'html'); //the view engine is html
app.engine('html', require('ejs').renderFile); // the templating engine is ejs
app.set('views', __dirname + '/views'); // views are stored in the Views folder
app.use(express.static(__dirname + '/public')); //static files (JS, CSS, images) are stored in the Public folder so they can be served by Express.js
app.get('../public/js/moment.min.js', function(req, res){
    res.sendFile(__dirname + '../public/js/moment.min.js'); 
});

require('./routes')(app, io);

// Print to the console where the application is running when it's launched.
console.log('Your application is running on http://localhost:' + port);
