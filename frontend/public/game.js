var socket = null;

//Prepare game
var app = new Vue({
    el: '#game',
    data: {
        connected: false,
        gameState: {state:0},
        totalTime: 30,
        timeLeft: null,
        timer: null,
        questionNumber: 1,
        answer: 0,
        question: 0,
        questionArray: [],
        questionCounter: 0,
        correctAnswerTotal: 0,
        username: '',
        currentPlayer: { username: '', score: 0, number: 0},
        players: [],
        hintMessage: '',
        isHost: false,
        roomUserList: []
    },
    computed: {
        progressBarWidth() {
            return (this.timeLeft / this.totalTime) * 100;
        }
    },
    mounted: function() {
        connect();
    },
    methods: {
        hint(question) {
            socket.emit('hint', question);
        },
        restartQuestions() {
            // start at question 1 again
            this.questionCounter = 0;
            this.questionNumber = 1;
            this.correctAnswerTotal = 0;
            // restart timer
            socket.emit('restartQuestions');
        },
        finish() {
            this.gameState.state = 1;
            this.questionArray = [];
            this.questionCounter = 0;
            this.questionNumber = 1;
            this.correctAnswerTotal = 0;
            clearInterval(this.timer);
        },
        showModal: function() {
            var myModal = new bootstrap.Modal(this.$refs.myModal);
            myModal.show();
          },
        showHint: function() {
            var myHint = new bootstrap.Modal(this.$refs.myHint);
            myHint.show();
        },
        guest() {
            socket.emit('guest', this.username);
        },
        setDifficulty(difficulty) {
            socket.emit('setDifficulty', difficulty);
        },
        startTimer() {
            // this.timeLeft = this.totalTime;
            // this.timer = setInterval(() => {
            //     if(this.timeLeft > 0) {
            //         this.timeLeft--;
            //     } else {
            //         this.showModal();
            //         clearInterval(this.timer);
                    

            //     }
            // }, 1000);
            socket.emit('start', this.gameState.state);
        },
        register() {},
        login() {},
        isUserAnswer(answer) {
            return answer === this.questionArray[this.questionCounter].userAnswer;
        },
        isAnswered() {
            if (this.questionArray[this.questionCounter].userAnswer == null) {
                return false;
            }
            else if (this.questionArray[this.questionCounter].userAnswer == this.questionArray[this.questionCounter].correctAnswer) {
                return true;
            }
            else {
                return false;
            }
        },
        nextQuestion(answer) {
            // Check the answer before incrementing the questionCounter
            answer == this.questionArray[this.questionCounter].correctAnswer ? this.correctAnswerTotal++ : this.correctAnswerTotal;
            this.questionArray[this.questionCounter].userAnswer = answer;
        
            if (this.questionCounter < this.questionArray.length - 1) {
                this.questionCounter++;
                this.questionNumber++;
            } 
            else {
                this.gameState.state = 5;
                clearInterval(this.timer);
            }
        },
        review() {
            this.gameState.state = 6;
            this.questionCounter = 0;
            this.questionNumber = 1;
        },

        next() {
            if (this.questionCounter < this.questionArray.length - 1) {
                this.questionCounter++;
                this.questionNumber++;
            }
            else {
                alert("No more questions!");
            }
        },
        previous() {
            if (this.questionCounter > 0) {
                this.questionCounter--;
                this.questionNumber--;
            }
            else {
                alert("No more previous questions!");
            }
        },
        nextState() {
            socket.emit('nextState', this.gameState.state);
        },
        leaderboard() {
            this.gameState.state = 7;
        },
        exit(player) {
            socket.emit('exit', { gameState: 0, player: player }); //back to "landing" page
        }


    }
});

function connect() {
    //Prepare web socket
    socket = io();

    //Connect
    socket.on('connect', function() {
        //Set connected state to true
        app.connected = true;
    });

    //Handle connection error
    socket.on('connect_error', function(message) {
        alert('Unable to connect: ' + message);
    });

    //Handle disconnection
    socket.on('disconnect', function() {
        alert('Disconnected');
        app.connected = false;
        app.gameState.state = 0;
    });

    // Handle quiz questions
    socket.on('updateQuestions', (data) => {
        app.questionArray = data.questions;
        app.gameState.state = data.state;
    });

    // Handle request to update game state
    // socket.on('updateGameState', (gameState) => {
    //     app.gameState.state = gameState;
    // });
    // Handle updates to all players
    socket.on('update', function(data) {
        app.gameState.state = data.state;
        app.currentPlayer = data.player;
        app.players = data.players;
    });

    socket.on('nextState', function(data) {
        app.gameState.state = data;
    });

    socket.on('start', function(data) {
        app.gameState.state = data;
        

    });

    socket.on('timer update', function(data) {
        app.timeLeft = data;
    });

    socket.on('timer ended', function() {
        app.showModal();
        clearInterval(app.timer);
    });

    socket.on('hint', function(data) {
        app.hintMessage = data;
        app.showHint();
    });

    socket.on('exit', function(data) {
        app.gameState.state = 0;
        app.players = data;
    });

    socket.on('userJoinRoom', (user) => {
        this.roomUserList.push(user);
    });

    socket.on('userExitRoom', (data) => {
        this.roomUserList = this.roomUserList.filter((user) => user.id !== userId);
        // update host state..
    });
      

}
