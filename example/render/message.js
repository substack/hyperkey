var hyperkey = require('../../');
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
