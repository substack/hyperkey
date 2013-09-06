var hyperspace = require('hyperspace');

module.exports = function (html, cb, _exists) {
    return hyperspace(html, function (row) {
        if (_exists && _exists(row)) return;
        
        var res = cb(row.value);
        if (!res || typeof res !== 'object') return res;
        
        if (typeof res['first'] === 'object') {
            res[':first']['data-key'] = row.key;
        }
        else if (typeof res['first'] === 'string') {
            res[':first'] = {
                _text: res[':first'],
                'data-key': row.key
            };
        }
        else res[':first'] = { 'data-key': row.key };
        
        if (row.range) {
            res[':first']['data-range'] = row.range;
        }
        
        return res;
    });
};
