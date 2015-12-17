var express = require('express');
var router = express.Router();
var util = require('../../lib/util.js');

//------------------- Admin Section ----------------------
router.get('/edit/:id',
  function (req, res, next) {
    if (!res.locals.isAdmin)
      return util.handle_unauthorized(next);
    next()
  },
  function(req, res, next) {
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
  }
);

router.post('/update',
  function (req, res, next) {
    if (!res.locals.isAdmin)
      return util.handle_unauthorized(next);
    if (!req.body) return next(new Error('Cannot get the req.body'));
    next()
  },
  function(req, res, next) {
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
  }
);

router.get('/create', 
  function (req, res, next) {
    if (!res.locals.isAdmin)
      return util.handle_unauthorized(next);
    next()
  },
  function(req, res, next) {
    res.render("create");
  }
);

router.post('/create', 
  function (req, res, next) {
    if (!res.locals.isAdmin)
      return util.handle_unauthorized(next);
    if (!req.body) return next(new Error('Cannot get the req.body'));
    next()
  },
  function(req, res, next) {
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
  }
);

router.get('/delete/:id',
  function (req, res, next) {
    if (!res.locals.isAdmin)
      return util.handle_unauthorized(next);
    next()
  },
  function(req, res, next) {
    var Role = req.models.role;
    Role.destroy({
      where: { id: req.params.id }
      })
      .then(function(deleteds){
          res.redirect("/roles");
        }, 
        function(error){
          return next(error);
      });
  }
);
//--------------------------------------------------------

//----------------- Authenticated section --------------------
/* GET users listing. */
router.get('/',
  function (req, res, next) {
    if (!res.locals.authenticated)
      return util.handle_unauthorized(next);
    next()
  },
  function(req, res, next) {
    var Role = req.models.role;
    Role.findAll()
      .then(function(roles){
          res.render("list", {roles: roles});
        }, 
        function(error){
          return next(error);
      });
  }
);


router.get('/:id',
  function (req, res, next) {
    if (!res.locals.authenticated)
      return util.handle_unauthorized(next);
    next()
  },
  function (req, res, next) {
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
  }
);
//--------------------------------------------------------

module.exports = router;
