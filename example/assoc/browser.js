var parse = require('level-assoc/parse');
var through = require('through');

var shoe = require('shoe');
var sock = shoe('/sock');

var render = require('./render/hackerspace.js')();
render.appendTo('#hackerspaces');

render.pipe(sock).pipe(magic(render, {
    hacker: { key: 'hackerspace', render: require('./render/hacker.js') }
}));

function magic (render, types) {
    var streams = {};
    render.on('element', function (elem) {
        var key = elem.getAttribute('data-key');
        streams[key] = {};
        Object.keys(types).forEach(function (k) {
            streams[key][k] = types[k].render().appendTo(elem);
        });
    });
    
    var p = parse();
    p.pipe(through(function (row) {
        var t = row && row.value && row.value.type;
        var s = t && types[t] && streams[row.value[types[t].key]];
        if (s && s[t]) {
            s[t].write(row);
        }
        else render.write(row);
    }));
    return p;
}
