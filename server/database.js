var assert = require('assert');
var config = require('../configs/config');
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
    //third parameter is optional
    assert(query);
    if (typeof params == 'function') {
        callback = params;
        params = [];
    }
    doIt();
    function doIt() {
        var client = connect();
        client.query(query, params, function(err, result) {
            if (err) {
                if (err.code === '') {
                    console.error('[INTERNAL] Warning: Retrying deadlocked transaction: ', query, params);
                    return doIt();
                }
                else return callback(err);
            }

            callback(null, result);
        });
    }
}

exports.query = query;

exports.validateUser = function(username, password, callback) {
    assert(username && password);

    query('SELECT id, password FROM users WHERE lower(username) = lower($1)', [username], function (err, data) {
        if (err) return callback(err);

        if (data.rows.length === 0)
            return callback('NO_USER');

        var user = data.rows[0];

        var verified = passwordHash.verify(password, user.password);
        if (!verified)
            return callback('WRONG_PASSWORD', user.id);

        callback(null, user);
    });
};
