const fs = require('fs-extra');
const readline = require('readline');
const path = require('path');
const {google} = require('googleapis');
const Promise = require('bluebird');

// If modifying these scopes, delete token.json.
//const SCOPES = ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.metadata.readonly'];
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';
const COMMANDS_FOLDER_ID = '1KW-D6PH5IaDdzzw1x4aF4c4ytRVNiiSU';
const SOUND_BASE_URL = './google_home_commands/';
const TEMP_SOUND_BASE_URL = './tmp_google_home_commands/';

// Load client secrets from a local file.

function downloadFileTest() {

    fs.readFile(CREDENTIALS_PATH, (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Drive API.
        authorize(JSON.parse(content),
            downloadFile);
    });
}

function listFolderTest() {

    fs.readFile(CREDENTIALS_PATH, (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Drive API.
        authorize(JSON.parse(content),
            getFilesInFolder);
    });
}


function updateCommands() {
    let auth = null;

    return getAuth()
        .then((returnAuth) => {
            auth = returnAuth;
            return Promise.all([
                    getFilesInFolder(auth, COMMANDS_FOLDER_ID),
                    clearDirectory(TEMP_SOUND_BASE_URL)
                ]
            );
        })
        .then((results) => {
            let newFileIds = results[0];
            return downloadFiles(auth, newFileIds);
        })
        .then(() => {
            return clearDirectory(SOUND_BASE_URL);
        })
        .then(() => {
            return copyContentsFromFolderToFolder(TEMP_SOUND_BASE_URL, SOUND_BASE_URL);
        })
        .catch((err) => {
            console.log('ERROR: ' + err)
            return Promise.reject(err);
        })

}

function copyContentsFromFolderToFolder(source, target) {
    console.log(`STEP: Copy Temp folder to main commands folder: from ${source} to ${target}`);
    return new Promise((resolve, reject) => {

        const fs = require('fs-extra');

        fs.copy(source, target, err => {
            if (err) return reject('FS Error: ' + err);
            console.log(`copied files from ${source} to ${target}`);
            return resolve('success');
        });

    })
}

function clearDirectory(dir) {
    console.log('STEP: Clear Directory: ' + dir);
    return new Promise((resolve) => {
        const directory = dir;
        fs.readdir(directory, (err, files) => {
            if (err) throw err;
            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
            }
        });

        return resolve('success');

    });
}

function getAuth() {
    return new Promise((resolve, reject) => {
        fs.readFile(CREDENTIALS_PATH, (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Drive API.
            authorize(JSON.parse(content),
                (auth) => {
                    return resolve(auth);
                }
            );
        });

    })
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

//1KW-D6PH5IaDdzzw1x4aF4c4ytRVNiiSU
/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
    const drive = google.drive({version: 'v3', auth});
    drive.files.list({
        pageSize: 100,
        fields: 'nextPageToken, files(id, name)',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const files = res.data.files;
        if (files.length) {
            files.map((file) => {
                console.log(`${file.name} (${file.id})`);
            });
        } else {
            console.log('No files found.');
        }
    });
}


function getFilesInFolder(auth, folderId) {
    console.log('STEP: List files in Google Drive Folder: ' + folderId);
    const drive = google.drive({version: 'v3', auth});

    return new Promise((resolve, reject) => {

        drive.files.list({
            pageSize: 100,
            q: `'${folderId}' in parents`,
            fields: 'nextPageToken, files(id, name)'
        }, (err, res) => {
            if (err) {
                return reject('g-drive list error: ' + err);
            }

            const files = res.data.files;
            if (files.length) {
                return resolve(files.map(file => file.id));
            } else {
                console.log('No files found.');
                return reject('No Files Found');
            }
        });
    });

}

function downloadFile(auth, fileId, index) {
    const drive = google.drive({
        version: 'v3',
        auth
    });
    var dest = fs.createWriteStream(`${TEMP_SOUND_BASE_URL}soundFile.${Date.now()}-${index}.wav`);
    return new Promise((resolve, reject) => {
        drive.files.get({fileId: fileId, alt: 'media'}, {responseType: 'stream'},
            function (err, res) {
                res.data
                    .on('end', () => {
                        console.log('Downloaded file: ' + fileId);
                        return resolve('Downloaded file: ' + fileId)
                    })
                    .on('error', err => {
                        console.log('Error on file: ' + fileId, err);
                        return reject('Error on file: ' + fileId);
                    })
                    .pipe(dest);
            });
    })
}

function downloadFiles(auth, fileIds) {
    console.log('STEP: Download files from Google Drive Folder: ' + (fileIds ? fileIds.join(', ') : 'NULL'));
    let promises = [];
    fileIds.forEach((fileId, index) => {

        promises.push(downloadFile(auth, fileId, index));
    });

    return Promise.all(promises);
}


function listFilesInLocalFolder(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                console.log(err);
                return reject('unable to list filenames');
            }

            return resolve(files);
        });
    })
}

function uploadFile(auth, filePath, fileName, folderId) {
    const drive = google.drive({
        version: 'v3',
        auth
    });
    var fileMetadata = {
        'name': fileName,
        parents: [folderId]
    };
    var media = {
        mimeType: 'audio/wav',
        body: fs.createReadStream(filePath + fileName)
    };
    drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    }, function (err, file) {
        if (err) {
            // Handle error
            console.log(err);
        } else {
            console.log('File Id: ', file.data.id);
        }
    });
}

function uploadFileTest() {
    fs.readFile(CREDENTIALS_PATH, (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Drive API.
        authorize(JSON.parse(content),
            (auth) => {
                uploadFile(auth, SOUND_BASE_URL, 'soundFile.1546401736142-777.wav', COMMANDS_FOLDER_ID)
            });
    });
}

module.exports = {
    downloadFileTest: downloadFileTest,
    listFolderTest: listFolderTest,
    clearDirectoryTest: clearDirectory,
    updateCommands: updateCommands,
    listFilesInLocalFolder: listFilesInLocalFolder,
    uploadFileTest: uploadFileTest
};