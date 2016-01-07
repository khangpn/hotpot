var express = require('express');
var router = express.Router();
var util = require('../../lib/util.js');

//------------------- Admin Section ----------------------
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
    var Level = req.models.security_level;

    Level.create(data)
      .then(function(newLevel){
        res.redirect('/security_levels/' + newLevel.id);
      }, function(error){
        return res.render("create", {
          error: error
        });
      });
  }
);

router.get('/edit/:id',
  function (req, res, next) {
    if (!res.locals.isAdmin)
      return util.handle_unauthorized(next);
    next()
  },
  function(req, res, next) {
    var Level = req.models.security_level;
    Level.findById(req.params.id)
      .then(function(level) {
          res.render('edit', {level: level}); 
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
    if (!req.body.id) return next(new Error('Cannot get the security level ID'));
    next()
  },
  function(req, res, next) {
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
  }
);

router.get('/delete/:id',
  function (req, res, next) {
    if (!res.locals.isAdmin)
      return util.handle_unauthorized(next);
    next()
  },
  function(req, res, next) {
    var Level = req.models.security_level;
    Level.destroy({
      where: { id: req.params.id }
      })
      .then(function(deleteds){
          res.redirect("/security_levels");
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
    var Level = req.models.security_level;
    Level.findAll()
      .then(function(levels){
          res.render("list", {levels: levels});
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
    var Level = req.models.security_level;
    Level.findById(req.params.id)
      .then(function(level) {
          level.getAccounts({include: [
              req.models.account,
              req.models.project
            ]})
            .then(function (members) {
                res.render('view', {
                  level: level,
                  members: members}); 
              }, function (error) {
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
