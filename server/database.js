var passwordHash = require('password-hash');
var DBClient = require('./database_client');

exports.createUser = function(username, password, ipAddress, userAgent, callback) {
    assert(username && password);

    var hashedPassword = passwordHash.generate(password);

    DBClient.query('SELECT COALESCE(COUNT(*), 0) AS count FROM users WHERE lower(username) = lower($1)', [username],
        function(err, data) {
            if (err) return callback(err);

            assert(data.rows.length === 1);
            if (data.rows[0].count > 0)
                return callback('USERNAME_TAKEN');

            DBClient.query('INSERT INTO users(username, password) VALUES($1, $2) RETURNING id', [username, hashedPassword],
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

    DBClient.query('SELECT * FROM users WHERE lower(username) = lower($1)', [username], function (err, data) {
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

    DBClient.query('INSERT INTO sessions(id, user_id, ip_address, user_agent, expired) VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
        [sessionId, userId, ipAddress, userAgent, expired], function(err, res) {
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

    DBClient.query('UPDATE sessions SET expired = now() WHERE user_id = $1 AND expired > now()', [userId], callback);
};
