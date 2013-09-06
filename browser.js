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
        dup.emit('key');
    });
    hs.on('parent', function (root) {
        var start = root.getAttribute('data-start');
        var end = root.getAttribute('data-end');
        var parts = [ start, end ];
        var since = findSince(root, start, end);
        if (since) parts.push(since);
        tracker.queue(JSON.stringify(parts) + '\n');
        
        dup.emit('parent', root);
    });
    
    hs.on('element', function (elem) {
        dup.emit('element', elem);
    });
    
    var dup = duplexer(hs, tracker);
    dup.appendTo = function () { return hs.appendTo.apply(hs, arguments) };
    dup.prependTo = function () { return hs.prependTo.apply(hs, arguments) };
    dup.sortTo = function (target, cmp) {
        if (cmp === undefined) cmp = function (a, b) {
            var akey = a.getAttribute('data-key');
            var bkey = b.getAttribute('data-key');
            if (akey < bkey) return -1;
            else if (akey > bkey) return 1;
            return 0;
        };
        return hs.sortTo(target, cmp);
    };
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
        
        var res = cb(row.value, row.key);
        if (res) hyperglue(elem, res);
        return true;
    }
};

function findSince (root, start, end) {
    var since = undefined;
    for (var i = 0; i < root.childNodes.length; i++) {
        var node = root.childNodes[i];
        if (!node.getAttribute) continue;
        var key = node.getAttribute('data-key');
        if (!key) continue;
        if (!since || key > since) since = key;
    }
    return since;
}
