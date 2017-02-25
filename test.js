var database = require('./server/database');

database.createUser('test', 'test123', '127.0.0.1', 'user-agent', function(err) {
    if(err) return console.error(err);

    else console.log("Successfully created user");
});
