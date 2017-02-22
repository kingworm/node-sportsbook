var assert = require('better-assert');
var async = require('async');
var request = require('request');
var timeago = require('timeago');
var lib = require('./lib');
var database = require('./database');
var speakeasy = require('speakeasy');
var uuid = require('uuid');
var _ = require('lodash');
var config = require('../configs/config');

var sessionOptions = {
    httpOnly: true,
    secure : config.PRODUCTION
};
//
// exports.login = function(req, res, next) {
//     var username = lib.removeNullsAndTrim(req.body.username);
//     var password = lib.removeNullsAndTrim(req.body.password);
//     var remember = !!req.body.remember;
//     var ipAddress = req.ip;
//     var userAgent = req.get('user-agent');
//
//     if (!username || !password)
//         return res.render('login', { warning: 'no username or password' });
//
//     database.validateUser(username, password, otp, function(err, userId) {
//         if (err) {
//             console.log('[Login] Error for ', username, ' err: ', err);
//
//             if (err === 'NO_USER')
//                 return res.render('login',{ warning: 'Username does not exist' });
//             if (err === 'WRONG_PASSWORD') {
//                 assert(userId);
//                 console.log('Wrong password for: ', username, ' was ', password, ' and ua: ', userAgent, ' and fp: ', fp, ' and ip ', ipAddress);
//                 database.logFailedLogin(userId, ipAddress, userAgent, fp);
//                 return res.render('login', {warning: 'Invalid password'});
//             }
//
//             return next(new Error('Unable to validate user ' + username + ': \n' + err));
//         }
//         assert(userId);
//
//         database.createSession(userId, ipAddress, userAgent, remember, function(err, sessionId, expires) {
//             if (err)
//                 return next(new Error('Unable to create session for userid ' + userId +  ':\n' + err));
//
//             if(remember)
//                 sessionOptions.expires = expires;
//
//             res.cookie('id', sessionId, sessionOptions);
//             res.redirect('/');
//         });
//     });
// };
