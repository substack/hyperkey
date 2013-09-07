var shoe = require('shoe');
var render = require('./render/hackerspace.js')();
var sock = shoe('/sock');
var parse = require('level-assoc/parse');

var trace = require('through')(function (row) {
    console.log('TRACE', row);
    this.queue(row);
});
var p = parse();
p.on('data', function (row) {
    console.log(row);
});
render.pipe(sock).pipe(trace).pipe(p).pipe(render.sortTo('#hackerspaces'));
