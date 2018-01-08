var Gpio = require('onoff').Gpio;

var button = new Gpio(4, 'in', 'falling', {
    debounceTimeout : 50
});



var button2 = new Gpio(26, 'in', 'falling', {
    debounceTimeout : 50
});


var count1 = 0;
button.watch(function(err, value) {
    if (err) {
        throw err;
    }

    if(value === 0){
        console.log('P1 clicked!');
        count1 += 1;
    }

    //led.writeSync(value);
});


var count2 = 0;
button2.watch(function(err, value) {
    if (err) {
        throw err;
    }

    if(value === 0){
        console.log('P2 clicked!');
        count2 += 1;
    }

    //led.writeSync(value);
});

process.on('SIGINT', function () {
    button.unexport();
    button2.unexport();
});
/*
setInterval(function(){
    console.log('Player 1 scores:' + count1);
    console.log('Player 2 scores:' + count2);
}, 2000);*/


var gameSeconds = 0;

setInterval(function(){

    if(count1>count2){
        console.log('Player 1 is winning by ' + (count1 - count2) + ' clicks!');
    }
    else if(count2>count1){
        console.log('Player 2 is winning by ' + (count2 - count1) + ' clicks!');
    }
    else{
        console.log('it\'s a tie?!');
    }

    console.log('====================================================');

    console.log('Player 1 -------------------------- ' + count1 + ' clicks at ' + (count1 / gameSeconds) + 'Clicks per Second!');
    console.log('Player 2 -------------------------- ' + count2 + ' clicks at ' + (count2 / gameSeconds) + 'Clicks per Second!');
}, 10000);


var pps1 = 0;
var pps2 = 0;
setInterval(function(){
 gameSeconds = gameSeconds+1;
    console.log('==========================PPS==========================');

    console.log('Player 1 -------------------------- ' + pps1 + ' PPS!');
    console.log('Player 2 -------------------------- ' + pps2 + ' PPS!');
    pps1 = 0;
    pps2 = 0;
}, 1000);