var shoe = require('shoe');
var render = require('./render/hackerspace.js')();
var sock = shoe('/sock');

render.pipe(sock).pipe(render.sortTo('#hackerspaces'));
