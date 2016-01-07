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
    var Priority = req.models.priority;

    Priority.create(data)
      .then(function(newPriority){
        res.redirect('/priorities/' + newPriority.id);
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
    var Priority = req.models.priority;
    Priority.findById(req.params.id)
      .then(function(priority) {
          res.render('edit', {priority: priority}); 
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
    if (!req.body.id) return next(new Error('Cannot get the security priority ID'));
    next()
  },
  function(req, res, next) {
    var data = req.body;
    var Priority = req.models.priority;

    Priority.findById(data.id)
      .then(function(priority) {
        priority.update(data)
          .then(function(priority) {
            res.redirect('/priorities/' + priority.id);
          }, function(error){
            return res.render("edit", {
              priority: priority,
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
    var Priority = req.models.priority;
    Priority.destroy({
      where: { id: req.params.id }
      })
      .then(function(deleteds){
          res.redirect("/priorities");
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
    var Priority = req.models.priority;
    Priority.findAll()
      .then(function(priorities){
          res.render("list", {priorities: priorities});
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
    var Priority = req.models.priority;
    Priority.findById(req.params.id)
      .then(function(priority) {
          priority.getTickets({include: [
              req.models.project,
              {
                model: req.models.account,
                as: 'owner'
              }
            ]})
            .then(function (tickets) {
                res.render('view', {
                  priority: priority,
                  tickets: tickets}); 
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
