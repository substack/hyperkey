var shoe = require('shoe');
var render = require('./render/message.js')();
var sock = shoe('/sock');

render.pipe(sock).pipe(render.appendTo('#messages'));
