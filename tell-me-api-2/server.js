var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileUpload = require('express-fileupload');
var https = require('https');
var fs = require('fs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var uploadRouter = require('./routes/upload');
var soundsRouter = require('./routes/sounds');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use('/', indexRouter);
//app.use('/users', usersRouter);
app.use('/upload', uploadRouter);
app.use('/sounds', soundsRouter);

https.createServer({
    key: fs.readFileSync('/home/pi/REPOs/tell-me/tell-me-api-2/key.pem'),
    cert: fs.readFileSync('/home/pi/REPOs/tell-me/tell-me-api-2/cert.pem'),
    passphrase: 'obiwankenobi'
}, app)
    .listen(3005);
console.log('listening on 3005');

