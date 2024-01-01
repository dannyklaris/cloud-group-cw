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


// function getQuestionsBackend
// .get()
// set = 1
// backend will send the questions from set 1 to the frontend
// io.emit
// everyone will get the questions from set 1


function handleGuestLogin(socket) {
  gameState = 1;
  socket.emit('guest', gameState);
}


function handleEasy(socket) {

  // get generated questions from API
  axios.get(questionsGetURL)
    .then(response => {
      let questions = response.data;

      gameState = 2;
      console.log("questions is: ");
      console.log(questions);

      // send questions to the backend
      // some function to send
      socket.emit('easy', {questions: questions, gameState: gameState});
    });

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
