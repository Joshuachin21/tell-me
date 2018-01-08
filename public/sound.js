var Sound = require('node-aplay');
var shell = require('shelljs');

var soundPath = '/home/pi/Music/sf2sound/';


shell.exec('aplay ' + soundPath + '2AH.wav');


 
// fire and forget: 
new Sound('/home/pi/Music/sf2sound/20H.wav').play();
 
// with ability to pause/resume: 
var music = new Sound('/home/pi/Music/sf3sound/20H.wav');
music.play();
 

// you can also listen for various callbacks: 
music.on('complete', function () {
    console.log('Done with playback!');
});