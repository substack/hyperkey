var hyperglue = require('hyperglue');
var hyperkey = require('./index.js');
var through = require('through');
var duplexer = require('duplexer');

module.exports = function (html, cb) {
    var elements = {};
    var hs = onstream(hyperkey(html, cb, exists));
    var tracker = through();
    var tracking = {};
    
    hs.on('key', function (key) {
        tracker.queue(JSON.stringify(key) + '\n');
        dup.emit('key');
    });
    hs.on('parent', function (root) {
        trackElement(root);
        dup.emit('parent', root);
    });
    
    hs.on('element', function (elem) {
        trackElement(elem);
        setTimeout(function () {
            dup.emit('element', elem);
        }, 0);
    });
    
    var dup = duplexer(hs, tracker);
    dup.appendTo = function () {
        return hs.appendTo.apply(hs, arguments);
    };
    
    dup.prependTo = function () {
        return hs.prependTo.apply(hs, arguments);
    };
    
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
    return pauseResumeHack(dup);
    
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
    
    function trackNested (root) {
        var nodes = document.querySelectorAll('*[data-start]');
        for (var i = 0; i < nodes.length; i++) {
            trackElement(nodes[i]);
        }
    }
    
    function trackElement (elem) {
        var start = elem.getAttribute('data-start');
        var end = elem.getAttribute('data-end');
        
        if (!start || !end) return;
        var parts = [ start, end ];
        var s = JSON.stringify(parts);
        if (tracking[s]) return;
        tracking[s] = true;
        
        //var since = findSince(elem, start, end);
        //if (since) parts.push(since);
        tracker.queue(s + '\n');
        trackNested(elem);
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

function pauseResumeHack (stream) {
    var pause = stream.pause;
    var resume = stream.resume;
    pause();
    
    var paused = false;
    stream.pause = function () {
        paused = true;
        return pause.call(this);
    };
    stream.resume = function () {
        paused = false;
        return resume.call(this);
    };
    
    process.nextTick(function () {
        stream.pause = pause;
        stream.resume = resume;
        if (!paused) stream.resume();
    });
    return stream;
}
