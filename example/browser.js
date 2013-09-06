var shoe = require('shoe');
var render = require('./render/message.js')();

shoe('/sock').pipe(render.appendTo('#messages'));
