/**
 * Checking the authentication token whether it is valid
 * put this mw after loading models
 */

module.exports = function (req, res, next) {
  var token_name = req.cookies.token;
  res.locals.authenticated = false;
  if (!token_name) {
    return next();
  }
  var Token = req.models.token;
  Token.findAll({
    where: {
      name: token_name
    },
    limit: 1,
    include: req.models.account
  }).then(
    function(tokens) {
      if (tokens && tokens.length === 1) {
        var token = tokens[0];
        if (token.validate()) {
          res.locals.authenticated = true;
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
