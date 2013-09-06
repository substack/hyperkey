var level = require('level-test')();
var sub = require('level-sublevel');
var db = sub(level('hyperkey-example.db', { valueEncoding: 'json' }));
module.exports = db;

var messages = [
    { type: 'message', who: 'substack', body: 'beep boop' },
    { type: 'message', who: 'trex', body: 'stomping on things' },
    { type: 'message', who: 'dalek', body: 'exterminate!' }
];

setInterval(function () {
    var msg = messages[Math.floor(Math.random() * messages.length)];
    msg.time = Date.now();
    db.put('message-' + msg.time, msg);
}, 1000);
