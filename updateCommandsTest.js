const GoogleDriveServices = require('./services/GoogleDriveServices');
const SOUND_BASE_URL = './google_home_commands/';


GoogleDriveServices.updateCommands().then(() => {
    console.log('Successfully updated commands!!');

    return GoogleDriveServices.listFilesInLocalFolder(SOUND_BASE_URL)
        .then((list) => {
            console.log(list);
        })
        .catch((err) => {
            console.log(err);
        });
});
