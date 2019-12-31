function captureUserMedia(mediaConstraints, successCallback, errorCallback) {
    var bufferSize = 1024;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.createJavaScriptNode) {
        audioNode = audioCtx.createJavaScriptNode(bufferSize, 1, 1);
    } else if (audioCtx.createScriptProcessor) {
        audioNode = audioCtx.createScriptProcessor(bufferSize, 1, 1);
    } else {
        throw 'WebAudio not supported!';
    }
    audioNode.connect(audioCtx.destination);
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
}

var recordedBlob = null;
var mediaConstraints = {
    audio: true
};

document.querySelector('#start-recording').onclick = function () {
    this.disabled = true;
    document.querySelector('#play-recording').disabled = true;
    captureUserMedia(mediaConstraints, onMediaSuccess, onMediaError);
};
document.querySelector('#stop-recording').onclick = function () {
    this.disabled = true;
    mediaRecorder.stop();
    mediaRecorder.stream.stop();

    document.querySelector('#pause-recording').disabled = true;
    document.querySelector('#start-recording').disabled = false;
    document.querySelector('#play-recording').disabled = false;

};
document.querySelector('#pause-recording').onclick = function () {
    this.disabled = true;
    mediaRecorder.pause();

    document.querySelector('#resume-recording').disabled = false;
};
document.querySelector('#play-recording').onclick = function () {

    if (!recordedBlob) {
        alert('nothing recorded');
        return;
    }

    let player = new window.Audio();
    player.src = window.URL.createObjectURL(recordedBlob);
    player.play();
};
document.querySelector('#resume-recording').onclick = function () {
    this.disabled = true;
    mediaRecorder.resume();

    document.querySelector('#pause-recording').disabled = false;
};
document.querySelector('#save-recording').onclick = function () {
    let name = document.getElementById('soundName').value;
    if (!name) {
        alert('Missing name, please name your sound!');
        return;
    }
    this.disabled = true;
    if (!recordedBlob) {
        alert('nothing recorded');
        return;
    }
    try {
        uploadToServer(recordedBlob, name);
        recordedBlob = null;
        audiosContainer.innerHTML = '';

    }
    catch (e) {
        alert(e);
    }
    document.getElementById('soundName').value = '';
    $('#myModal').modal('hide');
    location.reload();
    //mediaRecorder.save();

    // alert('Drop WebM file on Chrome or Firefox. Both can play entire file. VLC player or other players may not work.');
};

var mediaRecorder;

function onMediaSuccess(stream) {
    var audio = document.createElement('audio');

    audio = mergeProps(audio, {
        controls: true,
        muted: true
    });
    audio.srcObject = stream;
    audio.play();

    audiosContainer.appendChild(audio);
    audiosContainer.appendChild(document.createElement('hr'));

    mediaRecorder = new MediaStreamRecorder(stream);
    mediaRecorder.stream = stream;

    mediaRecorder.recorderType = StereoAudioRecorder;
    mediaRecorder.mimeType = 'audio/wav';

    // don't force any mimeType; use above "recorderType" instead.
    // mediaRecorder.mimeType = 'audio/webm'; // audio/ogg or audio/wav or audio/webm

    mediaRecorder.audioChannels = !!document.getElementById('left-channel').checked ? 1 : 2;
    mediaRecorder.ondataavailable = function (blob) {

        console.log('blob ready to play or save');
        recordedBlob = blob;
        //uploadToServer(blob);
    };


    var timeInterval = 60000;
    if (timeInterval) timeInterval = parseInt(timeInterval);
    else timeInterval = 5 * 1000;

    // get blob after specific time interval
    mediaRecorder.start(timeInterval);

    document.querySelector('#stop-recording').disabled = false;
    document.querySelector('#pause-recording').disabled = false;
    document.querySelector('#save-recording').disabled = false;
}

function onMediaError(e) {
    console.error('media error', e);
}

var audiosContainer = document.getElementById('audios-container');
var index = 1;

// below function via: http://goo.gl/B3ae8c
function bytesToSize(bytes) {
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

// below function via: http://goo.gl/6QNDcI
function getTimeLength(milliseconds) {
    var data = new Date(milliseconds);
    return data.getUTCHours() + " hours, " + data.getUTCMinutes() + " minutes and " + data.getUTCSeconds() + " second(s)";
}

window.onbeforeunload = function () {
    document.querySelector('#start-recording').disabled = false;
};


function uploadToServer(blob, name) {
    var file = new File([blob], `${name ? name : 'recording'}.${Date.now()}.wav`, {
        type: 'audio/wav'
    });

    // create FormData
    var formData = new FormData();
    formData.append('foo', file);

    makeXMLHttpRequest('/upload/audio', formData, function (err) {
        if (err) {
            console.log(err);
            alert(err);
            return;
        }
        var downloadURL = 'https://drive.google.com/open?id=1KW-D6PH5IaDdzzw1x4aF4c4ytRVNiiSU';
        console.log('File uploaded to this path:', downloadURL);
        alert('recording saved!!');
    });
}

function makeXMLHttpRequest(url, data, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            callback();
        }
    };
    request.open('POST', url);
    request.send(data);
}
