var hyperkey = require('../../../');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/hackerspace.html');
var hacker = require('./hacker.js');

module.exports = function () {
    return hyperkey(html, function (row) {
        return {
            '.name': row.name,
            '.hackers': (function (stream) {
                return {
                    'data-start': stream.startKey,
                    'data-end': stream.endKey,
                    _html: stream.pipe(hacker())
                };
            })(row.hackers())
        };
    });
};
