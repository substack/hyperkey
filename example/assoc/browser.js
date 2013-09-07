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

render.pipe(sock).pipe(parse()).pipe(render.sortTo('#hackerspaces'));
