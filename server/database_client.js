var assert = require('assert');
var config = require('./configs/config');
var mysql = require('mysql');

function connect() {
    return mysql.createConnection({
        host: config.DB.HOST,
        user: config.DB.USER,
        password: config.DB.PASS,
        database: config.DB.DATABASE
    });
}

function query(query, params, callback) {
    assert(query);
    if (typeof params == 'function') {
        callback = params;
        params = [];
    }
    doIt();
    function doIt() {
        var client = connect();
        client.query(query, params, function(err, result) {
            if (err) return callback(err);

            callback(null, result);
        });
    }
}
exports.query = query;

var test = connect();
test.query('SELECT * FROM users', function(err, result) {
    if(err) console.error(err);

    else console.log(result);
});
