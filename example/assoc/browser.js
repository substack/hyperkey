var shoe = require('shoe');
var render = require('./render/hackerspace.js')();
var sock = shoe('/sock');
var parse = require('level-assoc/parse');

var through = require('through');
var hacker = require('./render/hacker.js');

var streams = { hackerspace: {} };
[].forEach.call(document.querySelectorAll('.hackerspace'), function (elem) {
    var key = elem.querySelector('.name').textContent;
    streams.hackerspace[key] = hacker().appendTo(elem);
});

render.on('stream', function (stream) {
    console.log('STREAM=', stream);
});

render.pipe(sock).pipe(parse()).pipe(typeSieve({
    hackerspace: render.sortTo('#hackerspaces')
}));

function typeSieve (types) {
    return through(function (row) {
        var t = row.value.type;
        if (t === 'hackerspace') {
            types[t].write(row);
        }
        else if (t === 'hacker') {
            streams.hackerspace[row.value.hackerspace].write(row);
        }
    });
}
