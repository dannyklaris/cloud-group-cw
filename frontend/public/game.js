var socket = null;

//Prepare game
var app = new Vue({
    el: '#game',
    data: {
        connected: false,
    },
    mounted: function() {
        connect(); 
    },
    methods: {
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
    });

}
