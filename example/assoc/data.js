var level = require('level-test')();
var sub = require('level-sublevel');
var db = sub(level('hyperkey-example.db', { valueEncoding: 'json' }));
var assoc = require('level-assoc')(db);

assoc.add('hackerspace')
    .hasMany('hackers', [ 'type', 'hacker' ])
    .hasMany('tools', [ 'type', 'tool' ])
;
assoc.add('hacker')
    .hasMany('projects', [ 'type', 'project' ])
    .hasMany('usage', [ 'type', 'usage' ])
;
assoc.add('tool')
    .hasMany('usage', [ 'type', 'usage' ])
;

exports.db = db;
exports.assoc = assoc;

var rows = require('./data.json');
var spaces = rows.map(function (row) {
    return row.value.type === 'hackerspace' && row.key;
}).filter(Boolean);

db.batch(rows.map(function (row) {
    return { type: 'put', key: row.key, value: row.value };
}));

setTimeout(function () {
    var name = 'x' + Math.floor(Math.random() * Math.pow(16, 8)).toString(16);
    db.put(name, { type: 'hackerspace', name: name });
    spaces.push(name);
}, 2200);

setInterval(function () {
    var name = Math.floor(Math.random() * Math.pow(16, 8)).toString(16);
    var space = spaces[Math.floor(Math.random() * spaces.length)];
    db.put(name, { type: 'hacker', name: name, hackerspace: space });
}, 500);
