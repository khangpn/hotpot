var express = require('express');
var router = express.Router();

//------------------- Admin Section ----------------------
router.post('/update_member_security', function (req, res, next) {
  if (!req.body)
    return next(new Error('Cannot get the req.body'));
  var data = req.body;
  if (!data.project_id || !data.account_id) 
    return next(new Error('project_id and account_id cannot be empty'));
  if (!data.security_level) 
    return next(new Error('security_level cannot be empty'));
  var AccountProject = req.models.account_project;
  var SecurityLevel = req.models.security_level;
  var account_id = data.account_id;
  var project_id = data.project_id;

  AccountProject.findAll({
    where: {
      account_id: account_id,
      project_id: project_id
    }
  })
  .then(function(members) {
      if (!members || members.length == 0) 
        return next(
          new Error(
            "Can't find the info of member: " 
            + account_id + " in project: " + project_id
        ));
      var member = members[0];
      var security_level = data.security_level;

      SecurityLevel.findById(security_level)
      .then(function(security) {
          console.log(security);
          security.addAccount(member)
            .then(function() {
              res.redirect('/projects/' + project_id + '/member/' + account_id );
              }, function (error) {
                return next(error);
              }
            );
        }, function (error) {
          return next(error);
        }
      );
    }, 
    function(error) {
      return next(error);
  });
});

router.post('/add_member_role', function (req, res, next) {
  if (!req.body)
    return next(new Error('Cannot get the req.body'));
  var data = req.body;
  if (!data.project_id || !data.account_id) 
    return next(new Error('project_id and account_id cannot be empty'));
  if (!data.role) 
    return next(new Error('role cannot be empty'));
  var AccountProject = req.models.account_project;
  var Role = req.models.role;
  var account_id = data.account_id;
  var project_id = data.project_id;

  AccountProject.findAll({
    where: {
      account_id: account_id,
      project_id: project_id
    }
  })
  .then(function(members) {
      if (!members || members.length == 0) 
        return next(
          new Error(
            "Can't find the info of member: " 
            + account_id + " in project: " + project_id
        ));
      var member = members[0];
      var role = data.role;

      Role.findById(role)
      .then(function(role) {
          if (!role) 
            return next(new Error("Can't find the role: " + role));
          role.addAccount(member)
            .then(function() {
              res.redirect('/projects/' + project_id + '/member/' + account_id );
              }, function (error) {
                return next(error);
              }
            );
        }, function (error) {
          return next(error);
        }
      );
    }, 
    function(error) {
      return next(error);
  });
});

router.post('/remove_member_role', function (req, res, next) {
  if (!req.body)
    return next(new Error('Cannot get the req.body'));
  var data = req.body;
  if (!data.project_id || !data.account_id) 
    return next(new Error('project_id and account_id cannot be empty'));
  if (!data.role) 
    return next(new Error('role cannot be empty'));
  var AccountProject = req.models.account_project;
  var Role = req.models.role;
  var account_id = data.account_id;
  var project_id = data.project_id;

  AccountProject.findAll({
    where: {
      account_id: account_id,
      project_id: project_id
    }
  })
  .then(function(members) {
      if (!members || members.length == 0) 
        return next(
          new Error(
            "Can't find the info of member: " 
            + account_id + " in project: " + project_id
        ));
      var member = members[0];
      var role = data.role;

      Role.findById(role)
      .then(function(role) {
          if (!role) 
            return next(new Error("Can't find the role: " + role));
          role.removeAccount(member)
            .then(function() {
              res.redirect('/projects/' + project_id + '/member/' + account_id );
              }, function (error) {
                return next(error);
              }
            );
        }, function (error) {
          return next(error);
        }
      );
    }, 
    function(error) {
      return next(error);
  });
});
//--------------------------------------------------------

//------------------- Owner section ----------------------
//NOTE: after handling login, remove :id from this link
router.get('/edit/:id', function(req, res, next) {
  var Project = req.models.project;
  Project.findById(req.params.id)
    .then(function(project) {
        if (!project) return next(new Error("Can't find the project with id: " + req.params.id));
        res.render('edit', {
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
            res.render('edit', {
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

router.get('/delete/:id', function(req, res, next) {
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

router.get('/:id/member/:account_id', function (req, res, next) {
  var AccountProject = req.models.account_project;
  var account_id = req.params.account_id;
  var project_id = req.params.id;
  AccountProject.findAll({
    where: {
      account_id: account_id,
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
            + account_id + " in project: " + project_id
        ));
      members[0].getRoles()
        .then(function (roles) {
            res.render('member_view', {
              member: members[0],
              roles: roles
            }); 
          }, function (error) {
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
  var project_id = req.params.id;
  Project.findById(project_id)
    .then(function(project) {
        if (!project) return next(new Error("Can't find the project with id: " + req.params.id));

        //NOTE: Should move the accountproject query to Project instanceMethods
        var AccountProject = req.models.account_project;
        AccountProject.findAll({
          where: {
            project_id: project_id
          },
          include: [
            req.models.account, 
            req.models.security_level, 
            req.models.project
          ]
        })
        .then(function(members) {
            res.render('view', {
              project: project,
              members: members
            }); 
          }, 
          function(error) {
            return next(error);
        });
      }, 
      function(error) {
        return next(error);
    });
});
//--------------------------------------------------------

module.exports = router;
