/**
 * Checking the authentication token whether it is valid
 * put this mw after loading models
 */

var crypto = require('crypto');
module.exports = function (req, res, next) {
  var token_name = req.cookies.token;
  res.locals.authenticated = false;
  if (!token_name) {
    return next();
  }
  var hashed_token = crypto.createHash('md5').update(token_name).digest('hex');
  var Token = req.models.token;
  Token.findAll({
    where: {
      name: hashed_token
    },
    limit: 1,
    include: [{
      model: req.models.account,
      include: [
        req.models.account_detail
      ]
    }]
  }).then(
    function(tokens) {
      if (tokens && tokens.length === 1) {
        var token = tokens[0];
        if (token.validate()) {
          res.locals.authenticated = true;
          req.isAdmin = res.locals.isAdmin = token.account.is_admin || false;
          res.locals.current_account = token.account;
        } else {
          token.destroy().then(function() {
              return next();
            }, function(error) {
              return next(error);
            }
          );
        }
      }
      return next();
    }, function (error) {
      return next(error);
    }
  );
};
