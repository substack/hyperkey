# hyperkey

shared server+client rendering with live updates for key/value stores

# why progressive enhancement is great

* no more staring at a blank page for your javascript to load plus another
round-trip for the content to load
* accessible by default
* search engine friendly
* inspect your markup with curl

# example

Given some simple html:

``` html
<div class="message">
  <div>
    <span class="who"></span>
    <span class="time"></span>
  </div>
  <div class="body"></div>
</div>
```

we can write some simple rendering logic that will work on both the server and
the browser (with browserify and brfs):

``` js
var hyperkey = require('hyperkey');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/message.html');

module.exports = function () {
    return hyperkey(html, function (row) {
        return {
            '.time': row.time,
            '.who': row.who,
            '.body': row.body
        };
    });
};
```

To hook up a live stream from the server to the rendering logic in the browser,
we can just do:

``` js
var shoe = require('shoe');
var render = require('./render/message.js')();
var sock = shoe('/sock');

render.pipe(sock).pipe(render.sortTo('#messages'));
```

The render instance will output data to the websocket to keep track of the keys
and ranges to track updates automatically.

Now all we need is a server to pipe our rendering logic into some html:

``` js
var http = require('http');
var ecstatic = require('ecstatic')(__dirname + '/static');
var trumpet = require('trumpet');
var fs = require('fs');

var sub = require('level-sublevel');
var level = require('level');
var db = sub(level('test.db'));

var tracker = require('level-track')(db);
var render = require('./render/message.js');

var server = http.createServer(function (req, res) {
    if (req.url === '/') {
        var tr = trumpet();
        var range = [ 'message', 'message~' ];
        
        var messages = tr.select('#messages');
        messages.setAttribute('data-start', range[0]);
        messages.setAttribute('data-end', range[1]);
        
        db.createReadStream({ start: range[0], end: range[1] })
            .pipe(render())
            .pipe(messages.createWriteStream())
        ;
        readStream('index.html').pipe(tr).pipe(res);
    }
    else ecstatic(req, res);
});
server.listen(5000);

var shoe = require('shoe');
var sock = shoe(function (stream) {
    stream.pipe(tracker()).pipe(stream);
});
sock.install(server, '/sock');

function readStream (file) {
    return fs.createReadStream(__dirname + '/static/' + file);
}
```

The server will render all the messages written to the database into the html
and then whenever more data is written to the `db`, the browser will update
automatically!

# methods

``` js
var hyperkey = require('hyperkey')
```

## var stream = hyperkey(html, cb)

Create an object `stream` from an html string `html` and a callback
`cb(value, key)`.

When an object is written to the `stream`, `cb(value, key)` fires with the
`row.value` and the `row.key`.

The `cb(value, key)` should return an object mapping css selectors to attributes
and content as described by [hyperspace](https://npmjs.org/package/hyperspace).

On the server, the `stream` will output html data that can be piped to the
response object in an http handler.

In the browser, the `stream` will output newline-delimited json that can be fed
into [level-track](http://npmjs.org/package/level-track) to automatically track
the rendered ranges on the page to subscribe to live updates.

## stream.{appendTo,prependTo,sortTo}(target, ...)

In the browser, you can call methods on the underlying
[hyperspace](https://npmjs.org/package/hyperspace) instance
to insert elements into the DOM.

# install

With [npm](https://npmjs.org) do:

```
npm install hyperkey
```

# license

MIT
