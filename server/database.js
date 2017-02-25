var assert = require('assert');
var config = require('./configs/config');
var mysql = require('mysql');
var passwordHash = require('password-hash');

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


//FUNCTION BLOCK
exports.createUser = function(username, password, email, ipAddress, userAgent, fp, callback) {
    assert(username && password);

    var hashedPassword = passwordHash.generate(password);

    query('SELECT COALESCE(COUNT(*), 0) AS count FROM users WHERE lower(username) = lower($1)', [username],
        function(err, data) {
            if (err) return callback(err);

            assert(data.rows.length === 1);
            if (data.rows[0].count > 0)
                return callback('USERNAME_TAKEN');

            query('INSERT INTO users(username, password) VALUES($1, $2) RETURNING id', [username, hashedPassword],
                function(err, data) {
                    if(err) return callback(err);

                    assert(data.rows.length === 1);
                    var user = data.rows[0];
                    createSession(user.id, ipAddress, userAgent, callback);
                }
            );
        }
    );
};

exports.validateUser = function(username, password, callback) {
    assert(username && password);

    query('SELECT * FROM users WHERE lower(username) = lower($1)', [username], function (err, data) {
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

function createSession(userId, ipAddress, userAgent, remember, callback) {
    var sessionId = uuid.v4();

    var expired = new Date();
    if (remember)
        expired.setFullYear(expired.getFullYear() + 10);
    else
        expired.setDate(expired.getDate() + 21);

    query('INSERT INTO sessions(id, user_id, ip_address, user_agent, fingerprint, expired) VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
        [sessionId, userId, ipAddress, userAgent, fp, expired], function(err, res) {
        if (err) return callback(err);
        assert(res.rows.length === 1);

        var session = res.rows[0];
        assert(session.id);

        callback(null, session.id, expired);
    });
}
exports.createSession = createSession;

exports.expireSessionsByUserId = function(userId, callback) {
    assert(userId);

    query('UPDATE sessions SET expired = now() WHERE user_id = $1 AND expired > now()', [userId], callback);
};
