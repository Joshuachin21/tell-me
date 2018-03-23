var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http); //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO

var Button1 = new Gpio(18, 'in', 'rising', {
    debounceTimeout: 50
});

const SOUND_BASE_URL = '/home/pi/Music/google_home_commands/';
const SONG_BASE_URL = '/home/pi/Music/songs/';

var randomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

http.listen(8080);

//SOUNDS

// With full options

var Sound = require('node-aplay');
var google_home_itsy_bitsy_spider = new Sound(SOUND_BASE_URL + 'home_itsy_bitsy_spider.wav');
var choochooSong = new Sound(SONG_BASE_URL + 'ChuggaChuggaChooChoo.wav');

var sounds = [];
sounds.push(google_home_itsy_bitsy_spider);
sounds.push(choochooSong);

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
Button1.watch(function (err, value) {
    console.log(value);
    if (err) {

        console.error('There was an error', err); //output error message to console
        return;
    }


    if (value === 0) {
        console.log('in');
        try {
            google_home_itsy_bitsy_spider.stop();
            //choochooSong.stop();

        }
        catch (err) {
            console.log(err);
        }
        google_home_itsy_bitsy_spider.play();
        //choochooSong.play();
    }


});

io.sockets.on('connection', function (socket) {// WebSocket Connection


    console.log('socket');


    //READ FROM CLIENT
    socket.on('light', function (data) {
        lightvalue = data;
        //console.log('changed light switch pi');

        rand = 11919191498 + Date.now();
        setTimeout(function () {
            socket.emit('score', rand);
        }, 1000);
    });

});

process.on('SIGINT', function () { //on ctrl+c
    Button1.unexport();
    process.exit(); //exit completely
});