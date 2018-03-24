var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http); //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
const HomeCommands = require('./services/HomeCommands.services');
const CONFIG = require('./config');
const SOUND_BASE_URL = '/home/pi/Music/google_home_commands/';
const SONG_BASE_URL = '/home/pi/Music/songs/';

/*
* INIT GPIOs
*
*/
var Button1 = new Gpio(18, 'in', 'rising', {
    debounceTimeout: 50
});

var Button2 = new Gpio(17, 'in', 'rising', {
    debounceTimeout: 50
});

var Button3 = new Gpio(27, 'in', 'rising', {
    debounceTimeout: 50
});


/*
* INIT Sounds
*
*/

const ItsyBitsySpider = new HomeCommands();


var randomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};


/*
* INIT webserver
*
*/
http.listen(8080);

//SOUNDS

// With full options

var Sound = require('node-aplay');

var choo_choo = new Sound(SOUND_BASE_URL + 'google_choochoo_livingroom_home.wav');
var itsy_bitsy_spider = new Sound(SOUND_BASE_URL + 'google_itsy_bitsy.wav');
var jesus_loves_me = new Sound(SOUND_BASE_URL + 'jesus_loves_me.wav');
var songs_by_listener_kids = new Sound(SOUND_BASE_URL + 'listener_kids.wav');
var on_the_livingroom_home = new Sound(SOUND_BASE_URL + 'on_the_livingroom_home.wav');

//GH tools

var google_next = new Sound(SOUND_BASE_URL + 'google_next.wav');
var google_stop = new Sound(SOUND_BASE_URL + 'google_stop.wav');


var sounds = [];
sounds.push(choo_choo);
sounds.push(itsy_bitsy_spider);
sounds.push(jesus_loves_me);
sounds.push(songs_by_listener_kids);

var iterator = 0;

function handler(req, res) { //create server
    fs.readFile(__dirname + '/public/index.html', function (err, data) { //read file index.html in public folder
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
            return res.end("404 Not Found");
        }
        res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
        res.write(data); //write data from index.html
        return res.end();
    });
}

//All Socket Commands
Button1.unwatchAll();
Button2.unwatchAll();
Button3.unwatchAll();

function iterate(){
    iterator = iterator + 1;
    if(iterator > sounds.length - 1){
        iterator = 0;
    }
}

Button1.watch(function (err, value) {
    console.log(value);
    if (err) {
        console.error('There was an error', err); //output error message to console
        return;
    }

    if (value === 0) {
        console.log('in');
        try {

            sounds[iterator].stop();

        }
        catch (err) {
            console.log(err);
        }
        sounds[iterator].play();
        iterate();
    }
});

Button2.watch(function (err, value) {
    console.log(value);
    if (err) {
        console.error('There was an error', err); //output error message to console
        return;
    }

    if (value === 0) {
        console.log('in');
        try {
            google_stop.stop();

        }
        catch (err) {
            console.log(err);
        }
        google_stop.play();
    }
});

Button3.watch(function (err, value) {
    console.log(value);
    if (err) {
        console.error('There was an error', err); //output error message to console
        return;
    }

    if (value === 0) {
        console.log('in');
        try {
            google_next.stop();

        }
        catch (err) {
            console.log(err);
        }
        google_next.play();
    }
});

io.sockets.on('connection', function (socket) {// WebSocket Connection
    console.log('socket');
    //READ FROM CLIENT
    socket.on('light', function (data) {
        setTimeout(function () {
            socket.emit('score', rand);
        }, 1000);
    });
});

process.on('SIGINT', function () { //on ctrl+c
    Button1.unexport();
    Button2.unexport();
    Button3.unexport();
    process.exit(); //exit completely
});