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
        guest() {
            socket.emit('guest');
        },
        easy() {
            socket.emit('easy');
        },
        startTimer() {
            this.timeLeft = this.totalTime;
            this.timer = setInterval(() => {
                if(this.timeLeft > 0) {
                    this.timeLeft--;
                } else {
                    clearInterval(this.timer);
                }
            }, 1000);
            this.gameState.state = 3;
        },
        register() {},
        login() {},
        nextQuestion(answer) {
            if (this.questionCounter < this.questionArray.length - 1) {
                this.questionCounter++;
                this.questionNumber++;
                answer == this.questionArray[this.questionCounter - 1].correctAnswer ? this.correctAnswerTotal++ : this.correctAnswerTotal;
                // stop the timer
                clearInterval(this.timer);
                this.questionArray[this.questionCounter - 1].userAnswer = answer;
            }
            else {
                answer == this.questionArray[this.questionCounter].correctAnswer ? this.correctAnswerTotal++ : this.correctAnswerTotal;
                this.gameState.state = 4;
            }
        },
        review() {
            this.gameState.state = 5;
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

    // Handle guest login
    socket.on('guest', function(data) {
        app.gameState.state= data;
    });

   // Handle easy difficulty
   socket.on('easy', function(data) {
        app.gameState.state = data.gameState;
        app.questionArray = data.questions;
    });

}
