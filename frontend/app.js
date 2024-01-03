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
let players = new Map();
let playersToSocket = new Map();
let socketToPlayers = new Map();
let playerNumber = 0;
let totalTime = 30;
let timeLeft = totalTime;
let timer;

function handleGuestLogin(socket, username) {
  gameState = 1;
  playerNumber++;
  players.set(username, {username: username, score: 0, number: playerNumber});
  playersToSocket.set(username, socket);
  socketToPlayers.set(socket, username);
  // socket.emit('guest', gameState);
  updateAll();
}

function updatePlayer(socket) {
  const playerName = socketToPlayers.get(socket);
  const player = players.get(playerName);
  const data = { state: gameState, player: player, players: Object.fromEntries(players) };
  socket.emit('update', data);
}

function updateAll() {
  console.log('Updating all players');
  for (let [username, socket] of playersToSocket) {
    updatePlayer(socket);
  }
}

function handleDifficulty(socket, difficulty) {

  // update gamestate
  gameState = 3;

  axios.get(

    // get generated questions from API
    questionsGetURL, {
      data: {difficulty: difficulty},
      headers: {'Content-Type': 'application/json'}
    }

  ).then(

    // update the client once the questions have been received
    response => {
      io.emit('updateQuestions', {questions: response.data, state: gameState} );
    }

  );

}

//Handle new connection
io.on('connection', socket => { 
  console.log('New connection');

  
  // Handle guest login
  socket.on('guest', (username) => {
    console.log('Guest login with username: ' + username);
    handleGuestLogin(socket, username);
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

  socket.on('nextState', (data) => {
    gameState = data;
    gameState++;
    io.emit('nextState', gameState);
  });

  socket.on('start', function(data) {
    gameState = data;
    gameState++;
    // Start the timer only if it's not already running
    if (!timer) {
        timeLeft = totalTime;
        timer = setInterval(() => {
            if(timeLeft > 0) {
                timeLeft--;
                // Emit the updated time to all connected sockets
                io.sockets.emit('timer update', timeLeft);
            } else {
                clearInterval(timer);
                timer = null; // Reset the timer
                // You can emit a 'timer ended' event here if needed
                io.sockets.emit('timer ended');
            }
        }, 1000);
    }
    io.emit('start', gameState);
});
});

//Start server
if (module === require.main) {
  startServer();
}

module.exports = server;
