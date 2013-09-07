var hyperkey = require('../../../');
var fs = require('fs');
var html = fs.readFileSync(__dirname + '/hacker.html');

module.exports = function () {
    return hyperkey(html, function (row) {
        return { '.name': row.name };
    });
};
