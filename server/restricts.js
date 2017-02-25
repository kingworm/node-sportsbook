exports.restrict = function(req, res, next) {
    if (!req.user) {
       res.status(401);
       if (req.header('Accept') === 'text/plain')
          res.send('Not authorized');
       else
          res.render('401');
       return;
    } else
        next();
}

exports.restrictRedirectToHome = function(req, res, next) {
    if(!req.user) {
        res.redirect('/');
        return;
    }
    next();
}
