

class MessageTransfer {
    constructor() {
        this.queue = [];
        this.channel = "sync/";
        this.connectState = false;
    }

    setStateOn() {
        this.connectState = true;
        this.run();
    }

    setStateOff() {
        this.connectState = false;
    }

    run() {
        let self = this;
        let handleRun = function() {
            if (self.queue.length > 0) {
                let data = self.queue.pop();
                client.publish(self.channel + data.database, data.value.toString(), {qos: 2}, (err) => {
                    if (err) self.queue.push(data);
                    if (self.connectState) {
                        setTimeout(handleRun, 0);
                    }
                });
            }
        };
        setTimeout(handleRun,0);
    }

    push(database, value) {
        if (value.indexOf('CREATE')==0 || value.indexOf('SHOW')==0 || value.indexOf('SELECT')==0) return;
        this.queue.push({
           database: database,
           value: value
        });
    }
}

let client = require('mqtt').connect('mqtt://localhost:1883', {clean: false, clientId: "local_backend" + Date.now().toString()})

let messageTransfer = new MessageTransfer();

client.on('connect', ()=>{
    messageTransfer.setStateOn();
});

client.on('offline', ()=>{
    messageTransfer.setStateOff();
});

module.exports = messageTransfer;

