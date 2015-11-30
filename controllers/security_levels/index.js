var express = require('express');
var router = express.Router();

//------------------- Admin Section ----------------------
router.get('/create', function(req, res, next) {
  res.render("create");
});

router.post('/create', function(req, res, next) {
  if (!req.body) return next(new Error('Cannot get the req.body'));

  var data = req.body;
  var Level = req.models.security_level;

  Level.create(data)
    .then(function(newLevel){
      res.redirect('/security_levels/' + newLevel.id);
    }, function(error){
      return res.render("create", {
        error: error
      });
    });
});

router.get('/edit/:id', function(req, res, next) {
  var Level = req.models.security_level;
  Level.findById(req.params.id)
    .then(function(level) {
        res.render('edit', {level: level}); 
      }, 
      function(error) {
        return next(error);
    });
});

router.post('/update', function(req, res, next) {
  if (!req.body) return next(new Error('Cannot get the req.body'));
  if (!req.body.id) return next(new Error('Cannot get the security level ID'));

  var data = req.body;
  var Level = req.models.security_level;

  Level.findById(data.id)
    .then(function(level) {
      level.update(data)
        .then(function(level) {
          res.redirect('/security_levels/' + level.id);
        }, function(error){
          return res.render("edit", {
            level: level,
            error: error
          });
        });
    }, function(error){
      return next(error);
    });
});

router.post('/:id/addAccount', function(req, res, next) {
  var Level = req.models.security_level;
  var Account = req.models.account;
  Level.findById(req.params.id)
    .then(function(level) {
        if (!level) return next(new Error("Can't find the level with id: " + req.params.id));
        var account_id = req.body.account_id;
        if (isNaN(account_id)) return next(new Error("Account ID must be integer"));
        Account.findById(account_id)
          .then(function(account) {
              if (!account) return next(new Error("Can't find the account with id: " + account_id));
              level.addAccount(account)
                .then(function() {
                  res.redirect('/security_levels/' + level.id);
                }, function (error) {
                  return next(error);
                });
            }, function (error) {
              return next(error);
            }
          );
      }, 
      function(error) {
        return next(error);
      }
    );
});

// After front-end implement AngularJs, this should be
// switch to post
router.get('/:id/removeAccount/:account_id', function(req, res, next) {
  var Level = req.models.security_level;
  var Account = req.models.account;
  Level.findById(req.params.id)
    .then(function(level) {
        if (!level) return next(new Error("Can't find the level with id: " + req.params.id));
        var account_id = req.params.account_id;
        if (isNaN(account_id)) return next(new Error("Account ID must be integer"));
        Account.findById(account_id)
          .then(function(account) {
              if (!account) return next(new Error("Can't find the account with id: " + account_id));
              level.removeAccount(account)
                .then(function() {
                  res.redirect('/security_levels/' + level.id);
                }, function (error) {
                  return next(error);
                });
            }, function (error) {
              return next(error);
            }
          );
      }, 
      function(error) {
        return next(error);
      }
    );
});
//--------------------------------------------------------

//----------------- Authenticated section --------------------
/* GET users listing. */
router.get('/', function(req, res, next) {
  var Level = req.models.security_level;
  Level.findAll()
    .then(function(levels){
        res.render("list", {levels: levels});
      }, 
      function(error){
        return next(error);
    });
});

router.get('/:id', function (req, res, next) {
  var Level = req.models.security_level;
  Level.findById(req.params.id)
    .then(function(level) {
        level.getAccounts()
          .then(function (members) {
              res.render('view', {
                level: level,
                members: members}); 
            }, function (errors) {
              return next(error);
            }
          );
      }, 
      function(error) {
        return next(error);
    });
});
//--------------------------------------------------------


module.exports = router;
