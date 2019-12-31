var express = require('express');
var fs = require('fs');
var router = express.Router();
//var GoogleDriveServices = require('../services/GoogleDriveServices');

/* GET users listing. */
router.post('/audio', function (req, res, next) {
    console.log(req.files.foo.name);
    console.log(req.files.foo.mimetype);
    console.log('test updload?');
    let filePath = '/home/pi/REPOs/tell-me/google_home_commands/';
    let fileName = req.files.foo.name;
    let fileLocation = filePath + fileName;
    downloadFile(req.files.foo.data, fileLocation);
    //GoogleDriveServices.uploadFile(filePath, fileName);
    res.send('respond with a resource');
});

function downloadFile(fileBuffer, fileName) {
    fs.writeFile(fileName, fileBuffer, (err) => {
        if (err) throw err;

        console.log("The file was succesfully saved!");
 fs.chmod(fileName, 0666, (error) => {
                        console.log('Changed file permissions');
                    });   
 });
}


module.exports = router;
