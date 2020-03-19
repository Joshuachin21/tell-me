var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http); //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
const fullAppPath = '/home/pi/REPOs/tell-me/';
const HomeCommands = require(fullAppPath + 'services/HomeCommands.services');
const GoogleDriveServices = require(fullAppPath + 'services/GoogleDriveServices');
const CONFIG = require(fullAppPath + 'config');
const SOUND_BASE_URL = fullAppPath + 'google_home_commands/';
const UTILITY_SOUND_BASE_URL = fullAppPath + 'google_home_utility_commands/';
const SONG_BASE_URL = fullAppPath + 'songs/';
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
var CommandsUpdateButton = new Gpio(21, 'in', 'rising', {
    debounceTimeout: 250
});

let CommandsUpdateButtonDebounceDelay = false;


var Button1 = new Gpio(23, 'in', 'rising', {
    debounceTimeout: 250
});

let Button1DebounceDelay = false;

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

const startDebounceTime = (delayVar, delayTime) => {
    delayVar = true;
    setTimeout(() => {
        delayVar = false;
    }, delayTime);
};


/*

var Button3 = new Gpio(23, 'in', 'rising', {
    debounceTimeout: 50
});*/


/*
* INIT Sounds
*
*/

function updateSoundFilenames() {
    return GoogleDriveServices.listFilesInLocalFolder(SOUND_BASE_URL)
        .then((list) => {
            sounds = list;
        })
        .catch((err) => {
            console.log(err);
        })
}

function playSound(path) {
    stopSounds();
    current_sound = new Sound(path);
    current_sound.play();
}

function update_google_home_commands() {
    if (CommandsUpdateButtonDebounceDelay) {
        console.log("Update Debounced. wait 30 sec.");
        return;
    }

    playSound(UTILITY_SOUND_BASE_URL + command_sounds[3]);
    startDebounceTime(CommandsUpdateButtonDebounceDelay, 30000);
    //todo add init sound here
    console.log('updating');
    return GoogleDriveServices.updateCommands()
        .then(updateSoundFilenames)
        .then(() => {
            playSound(UTILITY_SOUND_BASE_URL + command_sounds[4]);
        })
        .catch((e) => {
            console.log(e);
            playSound(UTILITY_SOUND_BASE_URL + command_sounds[5]);
        });
}

function relay_on() {
    if (FishDebounceDelay) {
        return;
    }
    startDebounceTime(FishDebounceDelay, 500);
    FishRelayState = true;
    FishRelay = new Gpio(6, 'out');
    FishRelay.writeSync(1);
    console.log('relay on');
}

function relay_off(gpio) {
    if (FishDebounceDelay) {
        return;
    }
    startDebounceTime(FishDebounceDelay, 500);
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


let sounds = [];

let command_sounds = [
    'google_next.wav',
    'google_stop.wav',
    'google_say_abcs.wav',
    'downloading_commands_now.wav',
    'downloads_complete.wav',
    'error_with_downloads.wav'

];
//update_google_home_commands();

let fileUpdateCounter = 0;
updateSoundFilenames();


var Sound = require('node-aplay');

let current_sound = null;

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
    if (!current_sound) {
        return;
    }
    try {
        log(current_sound);
        current_sound.stop();
    }
    catch
        (err) {
        log(err);
    }
}

CommandsUpdateButton.watch(function (err, value) {
    log(value);
    console.log('CommandsUpdateButton value: ' + value);
    if (err) {
        console.error('There was an error', err); //output error message to console
        return;
    }

    if (value === 0) {
        update_google_home_commands();
    }
});

Button1.watch(function (err, value) {
    log(value);
    console.log(value);
console.log('Button1');
    if (err) {
        console.error('There was an error', err); //output error message to console
        return;
    }

    if (true) {
        log('in');
        stopSounds();
        current_sound = new Sound(SOUND_BASE_URL + sounds[iterator]);
        current_sound.play();
        iterate();
    }

    fileUpdateCounter = fileUpdateCounter + 1;
    if (fileUpdateCounter > 5) {
        console.log('updating file names');
        updateSoundFilenames();
        fileUpdateCounter = 0;
    }
});

Button2.watch(function (err, value) {
    log(value);
console.log('Button2');
    if (err) {
        console.error('There was an error', err); //output error message to console
        return;
    }
    console.log(value);
    if (false) {
        log('in');
        stopSounds();
        current_sound = new Sound(UTILITY_SOUND_BASE_URL + command_sounds[0]);
        current_sound.play();
    }
});

Button3.watch(function (err, value) {
    log(value);
console.log('Button3');
    if (err) {
        console.error('There was an error', err); //output error message to console
        return;
    }
    console.log(value);
    if (false) {
        log('in');
        stopSounds();
        current_sound = new Sound(UTILITY_SOUND_BASE_URL + command_sounds[1]);
        current_sound.play();
    }
});

Button4.watch(function (err, value) {
    log(value);
console.log('Button4');
    if (err) {
        console.error('There was an error', err); //output error message to console
        return;
    }
    console.log(value);
    if (value === 1) {
        log('in');
//        update_google_home_commands();
    }
});
/*
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
        current_sound = new Sound(UTILITY_SOUND_BASE_URL + command_sounds[2]);
        current_sound.play();
    }
});*/

FishButtonShort.watch(function (err, value) {
    log(value);
console.log('fish button short');
    if (err) {
        console.error('There was an error', err); //output error message to console
        return;
    }
    console.log(value);
    if (value === 1) {
        if (FishRelayState) {
            relay_off(FishRelay);
            relay_on();
            setTimeout(() => {
                relay_off(FishRelay);
            }, 1200);
        }
        else {
            relay_on();
            setTimeout(() => {
                relay_off(FishRelay);
            }, 1200);
        }
    }
});

FishButtonLong.watch(function (err, value) {
    log(value);
console.log('fish button long');
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
