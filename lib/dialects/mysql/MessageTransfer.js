
class MessageTransfer {
    constructor(client) {
        this.queue = [];
        this.channel = "sync/";
        this.connectState = false;
        this.client = client;
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
                self.client.publish(self.channel + data.database, data.value.toString(), {qos: 2}, (err) => {
                    if (err) self.queue.push(data);
                    if (self.connectState) {
                        setTimeout(handleRun, 0);
                    }
                });
            } else {
                setTimeout(handleRun,50);
            }
        }
        setTimeout(handleRun,0);
    }

    push(database, value) {
        if (value.indexOf('CREATE')==0 || value.indexOf('SHOW')==0 || value.indexOf('SELECT')==0) return;
        //console.log('pushed: ', database, value);
        this.queue.unshift({
           database: database,
           value: value
        });
    }
}

let client = require('mqtt').connect(require('config').get("mqtt.host"), {clean: false, clientId: "BACKEND" + Date.now().toString()});

let messageTransfer = new MessageTransfer(client);

client.on('connect', ()=>{
    messageTransfer.setStateOn();
});

client.on('offline', ()=>{
    messageTransfer.setStateOff();
});

module.exports = messageTransfer;

