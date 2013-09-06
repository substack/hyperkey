var hyperspace = require('hyperspace');

module.exports = function (html, cb, _exists) {
    return hyperspace(html, function (row) {
        if (_exists && _exists(row)) return;
        var key = JSON.stringify(row.key);
        
        var res = cb(row.value);
        if (!res || typeof res !== 'object') return res;
        
        if (typeof res['first'] === 'object') {
            res[':first']['data-key'] = key;
        }
        else if (typeof res['first'] === 'string') {
            res[':first'] = {
                _text: res[':first'],
                'data-key': key
            };
        }
        else res[':first'] = { 'data-key': key };
        
        return res;
    });
};
