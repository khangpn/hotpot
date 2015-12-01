var express = require('express');
var router = express.Router();

//------------------- Admin Section ----------------------
//NOTE: after handling login, remove :id from this link
router.get('/edit/:id', function(req, res, next) {
  var Role = req.models.role;
  Role.findById(req.params.id)
    .then(function(role) {
        if (!role) return next(new Error("Can't find the role with id: " + req.params.id));
        res.render('edit', {
          role: role
        }); 
      }, 
      function(error) {
        return next(error);
    });
});

router.post('/update', function(req, res, next) {
  if (!req.body) return next(new Error('Cannot get the req.body'));

  var data = req.body;
  var Role = req.models.role;

  Role.findById(data.id)
    .then(function(role) {
        if (!role) return next(new Error("Can't find the role with id: " + req.params.id));
        delete data.id;
        role.update(data)
          .then(function(account) {
            res.redirect('/roles/' + role.id);
          }, function (error) {
            res.render('edit', {
              role: role,
              error: error
            }); 
          }
        );
      }, 
      function(error) {
        return next(error);
      }
    );
});

router.post('/create', function(req, res, next) {
  if (!req.body) return next(new Error('Cannot get the req.body'));

  var data = req.body;
  var Role = req.models.role;

  Role.create(data)
    .then(function(newRole){
      res.redirect('/roles/' + newRole.id);
    }, function(error){
    return res.render("create", {
        error: error
      });
    });
});

router.post('/:id/addAccount', function(req, res, next) {
  var Role = req.models.role;
  var Account = req.models.account;
  Role.findById(req.params.id)
    .then(function(role) {
        if (!role) return next(new Error("Can't find the role with id: " + req.params.id));
        var account_id = req.body.account_id;
        if (isNaN(account_id)) return next(new Error("Account ID must be integer"));
        Account.findById(account_id)
          .then(function(account) {
              if (!account) return next(new Error("Can't find the account with id: " + account_id));
              role.addAccount(account)
                .then(function() {
                  res.redirect('/roles/' + role.id);
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
  var Role = req.models.role;
  var Account = req.models.account;
  Role.findById(req.params.id)
    .then(function(role) {
        if (!role) return next(new Error("Can't find the role with id: " + req.params.id));
        var account_id = req.params.account_id;
        if (isNaN(account_id)) return next(new Error("Account ID must be integer"));
        Account.findById(account_id)
          .then(function(account) {
              if (!account) return next(new Error("Can't find the account with id: " + account_id));
              role.removeAccount(account)
                .then(function() {
                  res.redirect('/roles/' + role.id);
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
router.get('/delete/:id', function(req, res, next) {
});
//--------------------------------------------------------

//----------------- Authenticated section --------------------
/* GET users listing. */
router.get('/', function(req, res, next) {
  var Role = req.models.role;
  Role.findAll()
    .then(function(roles){
        res.render("list", {roles: roles});
      }, 
      function(error){
        return next(error);
    });
});


router.get('/:id', function (req, res, next) {
  var Role = req.models.role;
  Role.findById(req.params.id)
    .then(function(role) {
        if (!role) return next(new Error("Can't find the role with id: " + req.params.id));
        role.getAccounts({include: [
            req.models.account,
            req.models.project
          ]})
          .then(function (members) {
              res.render('view', {
                role: role,
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
