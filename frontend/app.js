'use strict';

// imports
const express = require('express');
const https = require('http');
const socketIO = require('socket.io');
const axios = require('axios');

// URL of the backend API
const BACKEND_ENDPOINT = process.env.BACKEND || 'http://localhost:7071';
const questionsGetURL = BACKEND_ENDPOINT + '/question/get'

let gameState = 0;

// set up express
const app = express();

// setup socket.io
const server = https.Server(app);
const io = socketIO(server);

// setup static page handling
app.set('view engine', 'ejs');
app.use('/static', express.static('public'));

// handle client interface on /
app.get('/', (req, res) => {
  res.render('client');
});
// handle display interface on /display
app.get('/display', (req, res) => {
  res.render('display');
});


// start the server
function startServer() {
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}


function handleGuestLogin(socket) {
  gameState = 1;
  socket.emit('updateGameState', gameState);
}


function handleDifficulty(socket, difficulty) {

  // update gamestate
  gameState = 2;
  socket.emit('updateGameState', gameState);

  axios.get(

    // get generated questions from API
    questionsGetURL, {
      data: {difficulty: difficulty},
      headers: {'Content-Type': 'application/json'}
    }

  ).then(

    // update the client once the questions have been received
    response => {
      socket.emit('updateQuestions', response.data);
    }

  );

}

//Handle new connection
io.on('connection', socket => { 
  console.log('New connection');

  // Handle guest login
  socket.on('guest', () => {
    console.log('Guest login');
    handleGuestLogin(socket);
  });

  // Handle difficulty selection
  socket.on('setDifficulty', (difficulty) => {
    console.log(`Difficulty selected: ${difficulty}`);
    handleDifficulty(socket, difficulty);
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
