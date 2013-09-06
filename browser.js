var hyperspace = require('hyperspace');
var hyperglue = require('hyperglue');
var hyperkey = require('./index.js');
var through = require('through');

module.exports = function (html, cb) {
    var elements = {};
    var hs = onstream(hyperkey(html, cb, exists));
    hs.track = function () {
        var tr = through();
        hs.on('key', function (key) {
            tr.queue(key + '\n');
        });
        return tr;
    };
    return hs;
    
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
        if (!elem || !prev) return;
        
        hyperglue(elem, function () {
            var res = cb(row.value);
            rows[row.key] = res;
        });
    }
};
