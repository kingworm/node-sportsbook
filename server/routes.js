var session = require('./session');
var config = require('./configs/config');
var restricts = require('./restricts');

function staticPageLogged(page, loggedGoTo) {

    return function(req, res) {
        var user = req.user;
        if (!user){
            return res.render(page);
        }
        if (loggedGoTo) return res.redirect(loggedGoTo);

        res.render(page, {
            user: user
        });
    }
}

module.exports = function(app) { // Routing parts

    app.get('/', staticPageLogged('index'));
    app.get('login', staticPageLogged('login'));

    app.post('/', session.login);
};
