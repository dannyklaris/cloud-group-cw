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
        roomUserList: [],
        hintCounter: 0,
        totalScores: 0,
        playerCounter: 0,
    },
    computed: {
        progressBarWidth() {
            return (this.timeLeft / this.totalTime) * 100;
        },
        playerNumbers() {
            return Object.keys(this.players).map((_, i) => i + 1);
        },
        sortedPlayers() {
            return Object.values(this.players).sort((a, b) => a.rank - b.rank);
          }
        
    },
    mounted: function() {
        connect();
    },
    methods: {
        scoresPlayer() {
            let correct = this.correctAnswerTotal * 30;
            let wrong = (this.questionArray.length - this.correctAnswerTotal) * 0;
            let hint = this.hintCounter * 10;
            let total = correct - (wrong + hint);
           
            if(total > 0) {
                this.totalScores = total;
            } else {
                this.totalScores = 0;
            }
            socket.emit('scores', {scores: this.totalScores, player: this.currentPlayer.username});
        },
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
            this.hintCounter++;
        },
        guest() {
            if (this.username === '') {
                    // Get the alert element
                var alertElement = document.getElementById('usernameAlert');

                // Remove the 'd-none' class to make the alert visible
                alertElement.classList.remove('d-none');

                return;
            }
            socket.emit('guest', this.username);
        },
        setDifficulty(difficulty) {
            socket.emit('setDifficulty', difficulty);
        },
        startTimer() {
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
                this.scoresPlayer();
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
            socket.emit('leaderboard');
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
        app.totalTime= 30;
        app.timeLeft= null;
        app.timer= null;
        app.questionNumber= 1;
        app.answer= 0;
        app.question= 0;
        app.questionArray= [];
        app.questionCounter= 0;
        app.correctAnswerTotal= 0;
        app.username= '';
        app.currentPlayer= { username: '', score: 0, number: 0};
        app.players =[];
        app.hintMessage= '';
        app.isHost = false;
        app.roomUserList = [];
        app.hintCounter = 0;
        
    });

    socket.on('disconnected', function(players) {
        app.players = players;
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

    socket.on('scores', function(data) {
        app.players = data;
        app.gameState.state = 5;
    });

    socket.on('updateScores', function(data) {
        app.currentPlayer = data.player;
        app.players = data.players;
    });

    socket.on('leaderboard', function(data) {
        var leaderboardAlert = document.getElementById('leaderboardAlert');
        var leaderboardModal = new bootstrap.Modal(document.getElementById('leaderboardModal'), {
            keyboard: false
        })

        

        
        if (data) {
            app.gameState.state = 7;
        } else {
            // To show the modal
            leaderboardModal.show();
            return;
        }
    });

      

}
