var fs = require('fs');

var Antiddos = require('anti-ddos')
var express = require('express');
var http = require('http');
var assert = require('assert');
var compression = require('compression');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var socketIO = require('socket.io');
var ioCookieParser = require('socket.io-cookie');
var _ = require('lodash');
var debug = require('debug')('app:index');
var morgan = require('morgan');
var path = require('path');

var app = express();

var config = require('./configs/config');
var routes = require('./routes');

debug('booting sportsbook');

/** Render Engine **/
app.set("views", path.join(__dirname, '../views'));

var dotCaching = true;

app.engine("html", require("dot-emc").init(
    {
        app: app,
        fileExtension:"html",
        options: {
            templateSettings: {
                cache: dotCaching
            }
        }
    }
).__express);

app.disable('x-powered-by');
app.enable('trust proxy');



/** Server Static content **/
var twoWeeksInSeconds = 1209600;

app.use('/node_modules', express.static(path.join(__dirname, '../node_modules'), { maxAge: twoWeeksInSeconds * 1000 }));


var antiddos = new Antiddos();
app.use(antiddos.express);

/** Middleware **/
app.use(bodyParser());
app.use(cookieParser());
app.use(compression());

app.use(morgan('common'));

/** App settings **/
app.set("view engine", "html");

/** Session setting **/
app.set('trust proxy', 1) // trust first proxy


/** Login Middleware **/
app.use(function(req, res, next) {
    debug('incoming http request');

    var sessionId = req.cookies.id;

    if (!sessionId) {
        res.header('Vary', 'Accept, Accept-Encoding, Cookie');
        res.header('Cache-Control', 'public, max-age=60'); // Cache the logged-out version
        return next();
    }

    res.header('Cache-Control', 'no-cache');
    res.header("Content-Security-Policy", "frame-ancestors 'none'");


    if (!lib.isUUIDv4(sessionId)) {
        res.clearCookie('id');
        return next();
    }

    next();

});

/** Error Middleware **/
function errorHandler(err, req, res, next) {

    if (err) {
        if(typeof err === 'string') {
            return res.render('error', { error: err });
        } else {
            if (err.stack) {
                console.error('[INTERNAL_ERROR] ', err, err.stack, req);
            } else console.error('[INTERNAL_ERROR', err);

            res.render('error');
        }

    } else {
        console.warning("A 'next()' call was made without arguments, if this an error or a msg to the client?");
    }

}

routes(app);
app.use(errorHandler);

/**  Server **/
var server = http.createServer(app);
var io = socketIO(server, config.SOCKET_IO_CONFIG);
io.use(ioCookieParser);

/** Socket io login middleware **/
io.use(function(socket, next) {
    debug('incoming socket connection');

    var ip = socket.request.connection.remoteAddress;
    var val = socket.request.headers['x-forwarded-for'];
    if (val) {
        var tmp = val.split(/\s*,\s*/)[0];
        if (tmp)
            ip = tmp;
    }

    var sessionId = (socket.request.headers.cookie)? socket.request.headers.cookie.id : null;

    if(!sessionId || !lib.isUUIDv4(sessionId)) {
        socket.user = false;
        return next();
    }

    next();
});

server.listen(config.SERVER.PORT, function() {
    console.log('Listening on port ', config.SERVER.PORT);
});

/** Log uncaught exceptions and kill the application **/
process.on('uncaughtException', function (err) {
    console.error(new Date() + ' uncaughtException:', err.message);
    console.error(err.stack);
    process.exit(1);
});
