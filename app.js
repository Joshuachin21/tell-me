var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http); //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
const HomeCommands = require('./services/HomeCommands.services');
const CONFIG = require('./config');
const SOUND_BASE_URL = '/home/pi/Music/google_home_commands/';
const SONG_BASE_URL = '/home/pi/Music/songs/';
/*
* logger
*
*/

const LOGGING = false;

function log(data) {
    if (LOGGING) {
        console.log(data);
    }
}

/*
* INIT GPIOs
*
*/
var Button1 = new Gpio(23, 'in', 'rising', {
    debounceTimeout: 250
});

var Button2 = new Gpio(17, 'in', 'rising', {
    debounceTimeout: 250
});

var Button3 = new Gpio(27, 'in', 'rising', {
    debounceTimeout: 250
});

var Button4 = new Gpio(22, 'in', 'rising', {
    debounceTimeout: 250
});

let FishButtonLong = new Gpio(24, 'in', 'rising', {
    debounceTimeout: 250
});

let FishButtonShort = new Gpio(25, 'in', 'rising', {
    debounceTimeout: 250
});

let FishRelay = null;
let FishRelayState = false;


let FishDebounceDelay = false;

const startDebounceTime = () => {
    FishDebounceDelay = true;
    setTimeout(() => {
        FishDebounceDelay = false;
    }, 500);
};


/*

var Button3 = new Gpio(23, 'in', 'rising', {
    debounceTimeout: 50
});*/


/*
* INIT Sounds
*
*/


function relay_on() {
    if (FishDebounceDelay) {
        return;
    }
    startDebounceTime();
    FishRelayState = true;
    FishRelay = new Gpio(6, 'out');
    FishRelay.writeSync(1);
    console.log('relay on');
}

function relay_off(gpio) {
    if (FishDebounceDelay) {
        return;
    }
    startDebounceTime();
    FishRelayState = false;
    gpio.writeSync(0);
    gpio.unexport();

    console.log('relay off');

}

function read_status(gpio) {
    if (!gpio) {
        return 0;
    }
    return gpio.readSync();
}


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


const sounds = [
    //'google_choochoo_livingroom_home.wav',
    'google_itsy_bitsy.wav',
    'jesus_loves_me.wav',
    'listener_kids.wav',
    'google_old_mcdonald.wav'
];

const command_sounds = [
    'google_next.wav',
    'google_stop.wav',
    'google_say_abcs.wav'
];

var Sound = require('node-aplay');

let current_sound = new Sound(SOUND_BASE_URL + 'google_stop.wav');

var iterator = 0;
var last_iterator = null;

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
Button4.unwatchAll();
FishButtonLong.unwatchAll();
FishButtonShort.unwatchAll();

function iterate() {
    last_iterator = iterator;
    iterator = iterator + 1;

    if (iterator > sounds.length - 1) {
        iterator = 0;
    }
    log('last iteration: ' + last_iterator);
    log('current iteration: ' + iterator);
}

function stopSounds() {
    try {
        log(current_sound);
        current_sound.stop();
    }
    catch
        (err) {
        log(err);
    }
}

Button1.watch(function (err, value) {
    log(value);
    console.log(value);
    if (err) {
        console.error('There was an error', err); //output error message to console
        return;
    }

    if (value === 0) {
        log('in');
        stopSounds();
        current_sound = new Sound(SOUND_BASE_URL + sounds[iterator]);
        current_sound.play();
        iterate();
    }
});

Button2.watch(function (err, value) {
    log(value);
    if (err) {
        console.error('There was an error', err); //output error message to console
        return;
    }
    console.log(value);
    if (value === 1) {
        log('in');
        stopSounds();
        current_sound = new Sound(SOUND_BASE_URL + command_sounds[0]);
        current_sound.play();
    }
});

Button3.watch(function (err, value) {
    log(value);
    if (err) {
        console.error('There was an error', err); //output error message to console
        return;
    }
    console.log(value);
    if (value === 1) {
        log('in');
        stopSounds();
        current_sound = new Sound(SOUND_BASE_URL + command_sounds[1]);
        current_sound.play();
    }
});

Button4.watch(function (err, value) {
    log(value);
    if (err) {
        console.error('There was an error', err); //output error message to console
        return;
    }
    console.log(value);
    if (value === 1) {
        log('in');
        stopSounds();
        current_sound = new Sound(SOUND_BASE_URL + command_sounds[2]);
        current_sound.play();
    }
});

FishButtonShort.watch(function (err, value) {
    log(value);
    if (err) {
        console.error('There was an error', err); //output error message to console
        return;
    }
    console.log(value);
    if (value === 1) {
        if (FishRelayState) {
            relay_off(FishRelay);
            relay_on();
            setTimeout(()=>{
                relay_off(FishRelay);
            }, 1000);
        }
        else{
            relay_on();
            setTimeout(()=>{
                relay_off(FishRelay);
            }, 1000);
        }
    }
});

FishButtonLong.watch(function (err, value) {
    log(value);
    if (err) {
        console.error('There was an error', err); //output error message to console
        return;
    }
    console.log(value);
    if (value === 1) {
        if (FishRelayState) {
            relay_off(FishRelay);
        }

        else {
            relay_on();
        }
    }
});

io.sockets.on('connection', function (socket) {// WebSocket Connection
    log('socket');
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
    Button4.unexport();
    FishButtonLong.unexport();
    FishButtonShort.unexport();
    process.exit(); //exit completely
});
