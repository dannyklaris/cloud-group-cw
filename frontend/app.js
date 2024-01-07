'use strict';

// imports
const express = require('express');
const https = require('http');
const socketIO = require('socket.io');
const axios = require('axios');

// URL of the backend API
const BACKEND_ENDPOINT = process.env.BACKEND || 'http://localhost:7071';
const questionsGetURL = BACKEND_ENDPOINT + '/question/get'
const hintGetURL = BACKEND_ENDPOINT + '/hint/get'


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
let gameState = 0;

function handleGuestLogin(socket, username) {
  gameState = 1;
  playerNumber++;
  if (playerNumber === 1) {
    players.set(username, {username: username + ' (guest)', score: 0, number: playerNumber, isHost: true, state: 0});
  }
  else {
    players.set(username, {username: username + ' (guest)', score: 0, number: playerNumber, isHost: false, state: 0});
  }
  
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

function updatePlayerScores(socket) {
  const playerName = socketToPlayers.get(socket);
  const player = players.get(playerName);
  const data = { player: player, players: Object.fromEntries(players) };
  socket.emit('updateScores', data);
}

function updateAllPlayerScores() {
  console.log('Updating all players scores');
  for (let [username, socket] of playersToSocket) {
    updatePlayerScores(socket);
  }
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

function handleHint(socket, question) {
  axios.get(
    hintGetURL, {
      data: {question: question},
      headers: {'Content-Type': 'application/json'}
    }
  ).then(
    response => {
      socket.emit('hint', response.data);
    }
  )
}

function playerExit(socket, player) {
  // get only the first string, not the guest
  let username = player.username.split(' ')[0];
  players.delete(username);
  playersToSocket.delete(username);
  socketToPlayers.delete(socket);
  let playerNumber = 1;
  for (let player of players.values()) {
    player.number = playerNumber++;
  }

  if (player.isHost) {
    if (players.size > 0) {
      // Get the first key in the map
      const firstKey = players.keys().next().value;

      // Get the player object associated with the first key
      const firstPlayer = players.get(firstKey);

      // Set isHost to true for the first player
      firstPlayer.isHost = true;
      

      // Update the map with the new player object
      players.set(firstKey, firstPlayer);
  }
  }
  console.log('players sent:')
  console.log(players);
  socket.emit('exit', players);
  updateAll();
}

function playerDisconnects(socket) {
  // Get the player object associated with the socket
  const player = players.get(socketToPlayers.get(socket));
  if (player === undefined) {
    return;
  }
  else {
    let username = player.username.split(' ')[0];

  // Delete the player from the map
  players.delete(username);

  // Delete the player from the playersToSocket map
  playersToSocket.delete(username);

  // Delete the socket from the socketToPlayers map
  socketToPlayers.delete(socket);

  // If the player was the host, set the host to the first player in the map
  if (player.isHost) {
      if (players.size > 0) {
          // Get the first key in the map
          const firstKey = players.keys().next().value;

          // Get the player object associated with the first key
          const firstPlayer = players.get(firstKey);

          // Set isHost to true for the first player
          firstPlayer.isHost = true;

          // Update the map with the new player object
          players.set(firstKey, firstPlayer);
      }
  }
  socket.emit('disconnected', players);

  // Update all players
  updateAll();
  }
}

// function handleScores(socket, scores, player) {
//   let username = player.split(' ')[0];
//   let playerObject = players.get(username);
//   playerObject.score = scores;
//   playerObject.state = 1;
//   players.set(username, playerObject);
//   console.log(players);
//   socket.emit('scores', players);
//   updateAllPlayerScores();
// }
function handleScores(socket, scores, player) {
  let username = player.split(' ')[0];
  let playerObject = players.get(username);
  playerObject.score = scores;
  playerObject.state = 1;
  players.set(username, playerObject);
  
  // Convert players map to array
  let playersArray = Array.from(players.values());

  // Sort players array by score in descending order
  playersArray.sort((a, b) => b.score - a.score);

  // Assign rank to each player
  for (let i = 0; i < playersArray.length; i++) {
    playersArray[i].rank = i + 1;
  }

  console.log(playersArray);
  socket.emit('scores', playersArray);
  updateAllPlayerScores();
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
    // Get the player object associated with the socket
    playerDisconnects(socket);
    updateAll();
  
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



  socket.on('restartQuestions', () => {
    // start the timer again
    if (!timer) {
        timeLeft = totalTime;
        timer = setInterval(() => {
            if(timeLeft > 0) {
                timeLeft--;
                // Emit the updated time to all connected sockets that haven't won
                io.sockets.emit('timer update', timeLeft);
            } else {
                clearInterval(timer);
                timer = null; // Reset the timer
                // You can emit a 'timer ended' event here if needed
                io.sockets.emit('timer ended');
            }
        }, 1000);
    }
  });

  socket.on('hint', (question) => {
    console.log('Hint is called');
    handleHint(socket, question);
  });

  socket.on('exit', (data) => {
    console.log('Player exit the lobby');
    playerExit(socket, data.player);
  });

  socket.on('scores', (data) => {
    console.log('Scores are called');
    handleScores(socket, data.scores, data.player);
  });

  socket.on('leaderboard', () => {
    console.log('Leaderboard is called');
    for (let [username, socket] of playersToSocket) {
      let player = players.get(username);
      console.log(player);
      let hasPlayerWithStateZero = Array.from(players.values()).some(player => player.state === 0);
      if (hasPlayerWithStateZero) {
          socket.emit('leaderboard', false);
      } else {
          socket.emit('leaderboard', true);
      }
  }
  
  })

});

//Start server
if (module === require.main) {
  startServer();
}

module.exports = server;
