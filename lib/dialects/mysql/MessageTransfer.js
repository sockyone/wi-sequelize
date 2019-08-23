let config = require('config');
let prefix = process.env.BACKEND_DBPREFIX || config.get("Database.prefix");

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
                if (data.database.indexOf(prefix) == 0) {
                    let username = data.database.slice(prefix.length, data.database.length);
                    self.client.publish(self.channel + username, data.value.toString(), {qos: 2}, (err) => {
                        if (err) {
                            self.queue.push(data);
                            console.log('failed in publishing:', err);
                        } else {
                            console.log('published:', data, 'to', self.channel + username);
                        }
                        if (self.connectState) {
                            setTimeout(handleRun, 0);
                        }
                    });
                }
                else {
                    setTimeout(handleRun, 0);
                }
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

let mqttUrl = process.env.BACKEND_MQTT_BROKER || config.get("mqttBroker");

let client = require('mqtt').connect(mqttUrl, {clean: false, clientId: "BACKEND" + Date.now().toString(), rejectUnauthorized: false});

let messageTransfer = new MessageTransfer(client);

client.on('connect', ()=>{
    messageTransfer.setStateOn();
});

client.on('offline', ()=>{
    messageTransfer.setStateOff();
});

module.exports = messageTransfer;

