var express = require('express');
var fs = require('fs');

const ms = require('mediaserver');
var router = express.Router();
//var GoogleDriveServices = require('../services/GoogleDriveServices');
const SOUND_BASE_URL = '/home/pi/REPOs/tell-me/google_home_commands/';
/* GET users listing. */
router.get('/', function (req, res, next) {
    return listFilesInLocalFolder().then(response => {
        console.log(response);
        res.send(response);
    });


});
router.delete('/:fileName', function (req, res, next) {

    console.log(req.params);
    return deleteFileByName(req.params.fileName).then(response => {
        console.log(response);
        res.send(response);
    });


});
router.get('/:fileName', function (req, res) {

    console.log(req.params);
    ms.pipe(req, res, SOUND_BASE_URL + req.params.fileName);

});

function listFilesInLocalFolder(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(SOUND_BASE_URL, (err, files) => {
            if (err) {
                console.log(err);
                return reject('unable to list filenames');
            }

            return resolve(files);
        });
    })
}

function deleteFileByName(fileName) {
    return new Promise((resolve, reject) => {
        fs.unlink(SOUND_BASE_URL + fileName, (err) => {
            if (err) {
                console.log(err);
                return reject('unable to list filenames');
            }

            return resolve('removed' + fileName);
        });
    })
}

module.exports = router;
