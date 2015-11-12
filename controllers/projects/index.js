var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  var Project = req.models.project;
  Project.findAll()
    .then(function(projects){
        res.render("list", {projects: projects});
      }, 
      function(error){
        return next(error);
    });
});

router.get('/create', function(req, res, next) {
  res.render("create");
});

router.post('/create', function(req, res, next) {
  if (!req.body) return next(new Error('Cannot get the req.body'));

  var data = req.body;
  var Project = req.models.project;

  Project.create(data)
    .then(function(newProject){
      res.redirect('/projects/' + newProject.id);
    }, function(error){
      return res.render("create", {
        error: error
      });
    });
});

router.post('/:id/addAccount', function(req, res, next) {
  var Project = req.models.project;
  var Account = req.models.account;
  Project.findById(req.params.id)
    .then(function(project) {
        if (!project) return next(new Error("Can't find the project with id: " + req.params.id));
        var account_id = req.body.account_id;
        if (isNaN(account_id)) return next(new Error("Account ID must be integer"));
        Account.findById(account_id)
          .then(function(account) {
              if (!account) return next(new Error("Can't find the account with id: " + account_id));
              project.addAccount(account)
                .then(function() {
                  res.redirect('/projects/' + project.id);
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
  var Project = req.models.project;
  var Account = req.models.account;
  Project.findById(req.params.id)
    .then(function(project) {
        if (!project) return next(new Error("Can't find the project with id: " + req.params.id));
        var account_id = req.params.account_id;
        if (isNaN(account_id)) return next(new Error("Account ID must be integer"));
        Account.findById(account_id)
          .then(function(account) {
              if (!account) return next(new Error("Can't find the account with id: " + account_id));
              project.removeAccount(account)
                .then(function() {
                  res.redirect('/projects/' + project.id);
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

router.get('/:id', function (req, res, next) {
  var Project = req.models.project;
  Project.findById(req.params.id)
    .then(function(project) {
        if (!project) return next(new Error("Can't find the project with id: " + req.params.id));
        project.getAccounts()
          .then(function (members) {
              res.render('view', {
                project: project,
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

module.exports = router;
