var socket = null;

//Prepare game
var app = new Vue({
    el: '#game',
    data: {
        connected: false,
        gameState: {state:0},
        totalTime: 30,
        timeLeft: null,
        timer: null
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
                    alert('Time is up!');
                }
            }, 1000);
        },
        register() {},
        login() {},

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
        app.gameState.state = data;
    });

}
