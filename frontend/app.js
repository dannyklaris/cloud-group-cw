'use strict';

//Set up express
const express = require('express');
const app = express();

//Setup socket.io
const server = require('http').Server(app);
const io = require('socket.io')(server);

//Setup static page handling
app.set('view engine', 'ejs');
app.use('/static', express.static('public'));

//Handle client interface on /
app.get('/', (req, res) => {
  res.render('client');
});
//Handle display interface on /display
app.get('/display', (req, res) => {
  res.render('display');
});

let gameState = 0;


// URL of the backend API
const BACKEND_ENDPOINT = process.env.BACKEND || 'http://localhost:7071';

//Start the server
function startServer() {
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

function handleGuestLogin(socket) {
  gameState = 1;
  socket.emit('guest', gameState);
}

function handleEasy(socket) {
  gameState = 2;
  socket.emit('easy', gameState);
}

//Handle new connection
io.on('connection', socket => { 
  console.log('New connection');

  // Handle guest login
  socket.on('guest', () => {
    console.log('Guest login');
    handleGuestLogin(socket);
  });

  // Handle easy difficulty
  socket.on('easy', () => {
    console.log('Easy difficulty');
    handleEasy(socket);
  });

  //Handle disconnection
  socket.on('disconnect', () => {
    console.log('Dropped connection');
    gameState = 0;
  });
});

//Start server
if (module === require.main) {
  startServer();
}

module.exports = server;
