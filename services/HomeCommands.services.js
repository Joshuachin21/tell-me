
class HomeCommands{

    constructor(initCommand, command, service, device, fileBaseUrl){
        this.initCommand = initCommand;
        this.command = command;
        this.service = service;
        this.device = device;
        this.fileBaseUrl = fileBaseUrl;
    }

    logName(){
        console.log(this.name);
    }




}

module.exports = HomeCommands;