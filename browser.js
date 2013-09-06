var hyperglue = require('hyperglue');
var hyperkey = require('./index.js');
var through = require('through');
var duplexer = require('duplexer');

module.exports = function (html, cb) {
    var elements = {};
    var hs = onstream(hyperkey(html, cb, exists));
    var tracker = through();
    hs.on('key', function (key) {
        tracker.queue(JSON.stringify(key) + '\n');
    });
    var dup = duplexer(hs, tracker);
    for (var key in hs) {
        if (typeof hs[key] === 'function') {
            dup[key] = (function (f) {
                return function () { return f.apply(hs, arguments) };
            })(hs[key]);
        }
        else dup[key] = hs[key];
    }
    return dup;
    
    function onstream (stream) {
        stream.on('element', function (elem) {
            var key = elem.getAttribute('data-key');
            if (!key) {
                var e = elem.querySelector('*[data-key]');
                if (!e) return;
                key = e.getAttribute('data-key');
            }
            hs.emit('key', key);
            elements[key] = elem;
        });
        stream.on('stream', onstream);
        return stream;
    }
    
    function exists (row) {
        var elem = elements[row.key];
        if (!elem) return false;
        
        var res = cb(row.value);
        if (res) hyperglue(elem, res);
        return true;
    }
};
