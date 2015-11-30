var express = require('express');
var router = express.Router();

//------------------- Admin Section ----------------------
router.post('/update_member', function (req, res, next) {
  console.log(req.body);
  if (!req.body)
    return next(new Error('Cannot get the req.body'));
  var data = req.body;
  if (!data.project_id || !data.member_id) 
    return next(new Error('project_id and account_id cannot be empty'));
  var AccountProject = req.models.account_project;
  var SecurityLevel = req.models.security_level;
  var Role = req.models.role;
  var member_id = data.member_id;
  var project_id = data.project_id;

  AccountProject.findAll({
    where: {
      account_id: member_id,
      project_id: project_id
    },
    include: [
      req.models.account, 
      req.models.security_level, 
      req.models.project
    ]
  })
  .then(function(members) {
      if (!members || members.length == 0) 
        return next(
          new Error(
            "Can't find the info of member: " 
            + member_id + " in project: " + project_id
        ));
      var member = members[0];

      if (data.security_level) {
        var security_level = data.security_level;
        SecurityLevel.findById(security_level)
        .then(function(security) {
            console.log(security);
            security.addAccount(member)
              .then(function() {
                }, function (errors) {
                  return next(error);
                }
              );
          }, function (errors) {
            return next(error);
          }
        );
      }

      if (data.role) {
        var role = data.role;
        Role.findById(role)
        .then(function(role) {
            role.addAccount(member)
              .then(function() {
                }, function (errors) {
                  return next(error);
                }
              );
          }, function (errors) {
            return next(error);
          }
        );
      }
      res.redirect('/projects/' + project_id + '/member/' + member_id );
    }, 
    function(error) {
      return next(error);
  });
});
//--------------------------------------------------------

//------------------- Owner section ----------------------
//NOTE: after handling login, remove :id from this link
router.get('/update/:id', function(req, res, next) {
  var Project = req.models.project;
  Project.findById(req.params.id)
    .then(function(project) {
        if (!project) return next(new Error("Can't find the project with id: " + req.params.id));
        res.render('update', {
          project: project
        }); 
      }, 
      function(error) {
        return next(error);
    });
});

router.post('/update', function(req, res, next) {
  if (!req.body) return next(new Error('Cannot get the req.body'));

  var data = req.body;
  var Project = req.models.project;

  Project.findById(data.id)
    .then(function(project) {
        if (!project) return next(new Error("Can't find the project with id: " + req.params.id));
        delete data.id;
        project.update(data)
          .then(function(account) {
            res.redirect('/projects/' + project.id);
          }, function (error) {
            res.render('update', {
              project: project,
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
//--------------------------------------------------------

//----------------- Authenticated section --------------------
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

router.get('/:id/member/:member_id', function (req, res, next) {
  var AccountProject = req.models.account_project;
  var member_id = req.params.member_id;
  var project_id = req.params.id;
  AccountProject.findAll({
    where: {
      account_id: member_id,
      project_id: project_id
    },
    include: [
      req.models.account, 
      req.models.security_level, 
      req.models.project
    ]
  })
  .then(function(members) {
      if (!members || members.length == 0) 
        return next(
          new Error(
            "Can't find the info of member: " 
            + member_id + " in project: " + project_id
        ));
      members[0].getRoles()
        .then(function (roles) {
            res.render('member_view', {
              member: members[0],
              roles: roles
            }); 
          }, function (errors) {
            return next(error);
          }
        );
    }, 
    function(error) {
      return next(error);
  });
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
//--------------------------------------------------------

module.exports = router;
