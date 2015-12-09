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
  Account.findAll({
    where: {
      name: data.name
    }
  })
    .then(function(accounts){
      var error = { errors: [] };
      function wrongAuth () {
        var e = {
          message: "Username or password is not correct"
        };
        error.errors.push(e);
        return res.render("login", {
          error: error
        });
      }
      if (!accounts || accounts.length===0) {
        wrongAuth();
      }

      var account = accounts[0];

      account.authenticate(data, function(error, result){
        if (error) return next(error);

        if (result) {
          if (data.remember === 'on') {
            res.cookie('token', account.id, {
              httpOnly: true,
              maxAge: 900000
            });
          } else {
            res.cookie('token', account.id, {
              httpOnly: true
            });
          }
          res.redirect('/accounts/' + account.id);
        } else {
          wrongAuth();
        }
      });
    }, function(error){
      return next(error);
    });
});

router.get('/logout', function(req, res, next) {
});
//--------------------------------------------------------


module.exports = router;
