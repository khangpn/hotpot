var express = require('express');
var router = express.Router();

//--------------- Unauthenticated section ------------------
router.get('/', function(req, res, next) {
  res.render("../../../views/index", {title: 'HotPot'});
});

router.get('/login', function(req, res, next) {
  res.render("login");
});

router.post('/login', function(req, res, next) {
  if (!req.body) return next(new Error('Cannot get the req.body'));
  var data = req.body;
  var Account = req.models.account;
  var Token = req.models.token;
  Account.findAll({
    where: {
      name: data.name
    }
  })
    .then(function(accounts){
      // Handle wrong authentication
      function wrongAuth () {
        var error = { errors: [] };
        var e = {
          message: "Username or password is not correct"
        };
        error.errors.push(e);
        return res.render("login", {
          error: error
        });
      }

      // Handle logging in
      function login() {
        var token = Token.generateToken();
        token.account_id = account.id;
        token.save()
          .then(function(tk){
            if (data.remember === 'on') {
              res.cookie('token', tk.name, {
                httpOnly: true,
                maxAge: 1209600000
              });
            } else {
              res.cookie('token', tk.name, {
                httpOnly: true
              });
            }
            res.redirect('/accounts/' + account.id);
            
          }, function(error) {
            return next(error);
          });
      }

      if (!accounts || accounts.length===0) {
        wrongAuth();
      }
      var account = accounts[0];
      account.authenticate(data, function(error, result){
        if (error) return next(error);

        if (result) {
          login();
        } else {
          wrongAuth();
        }
      });
    }, function(error){
      return next(error);
    });
});

router.get('/logout', function(req, res, next) {
  if (!req.body) return next(new Error('Cannot get the req.body'));
  var token_name = req.cookies.token;
  if (res.locals.authenticated && token_name) {
    var Account = req.models.account;
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
          token.destroy().then(function() {
              res.clearCookie('token');
              res.redirect('/');
            }, function(error) {
              return next(error);
            }
          );
        } else {
          res.redirect('/');
        }
      }, function (error) {
        return next(error);
      }
    );
  } else {
    res.redirect('/');
  }
});
//--------------------------------------------------------


module.exports = router;
