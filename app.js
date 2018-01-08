var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http); //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO

var Button1 = new Gpio(18, 'in', 'rising', {
    debounceTimeout: 50
});

const SOUND_BASE_URL = '/home/pi/Music/google_home_commands/';

var randomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

http.listen(8080);

//SOUNDS

// With full options

var Sound = require('node-aplay');
var google_home_itsy_bitsy_spider = new Sound(SOUND_BASE_URL + 'home_itsy_bitsy_spider.mp3');

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

io.sockets.on('connection', function (socket) {// WebSocket Connection

    Button1.unwatchAll();


    Button1.watch(function (err, value) { //Watch for hardware interrupts on pushButton
        //console.log('clicked 1 - 1');
        //console.log(value);
        if (err) { //if an error
            console.error('There was an error', err); //output error message to console
            return;
        }

        if (currentGameSettings.state === 'play') {

            if (value === 1) {
                punches[randomInt(0, punches.length - 1)].play();
                //console.log('1 - P1 clicked!');
                currentGameSettings.p1score += 1;
            }
        }

    });

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
    Team1Player1.unexport(); // Unexport LED GPIO to free resources
    Team2Player1.unexport(); // Unexport Button GPIO to free resources
    process.exit(); //exit completely
});