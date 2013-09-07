var http = require('http');
var ecstatic = require('ecstatic')(__dirname + '/static');
var trumpet = require('trumpet');
var fs = require('fs');

var assoc = require('./data.js');
var render = require('./render/hackerspace.js');

var server = http.createServer(function (req, res) {
    if (req.url === '/') {
        var tr = trumpet();
        var q = assoc.list('hackerspace');
        
        var elem = tr.select('#hackerspaces');
        elem.setAttribute('data-start', q.startKey);
        elem.setAttribute('data-end', q.endKey);
        
        q.pipe(render()).pipe(elem.createWriteStream());
        readStream('index.html').pipe(tr).pipe(res);
    }
    else ecstatic(req, res);
});
server.listen(5000);

var shoe = require('shoe');
var sock = shoe(function (stream) {
    stream.pipe(assoc.track()).pipe(stream);
});
sock.install(server, '/sock');

function readStream (file) {
    return fs.createReadStream(__dirname + '/static/' + file);
}
