var express = require('express');
var router = express.Router();
var util = require('../../lib/util.js');

//------------------- Admin Section ----------------------
router.post('/update_member', 
  function(req, res, next) {
    if (!res.locals.isAdmin) 
      return util.handle_unauthorized(next);
    if (!req.body) return next(new Error('Cannot get the req.body'));
    var data = req.body;
    if (!data.roles || data.roles.length == 0) return next(new Error('Member should have at least one role'));

    var AccountProject = req.models.account_project;
    var account_id = data.account_id;
    var project_id = data.project_id;
    AccountProject.findAll({
      where: {
        account_id: account_id,
        project_id: project_id
      },
      include: [
        req.models.account, 
        req.models.security_level, 
        req.models.project,
        {
          model: req.models.role,
          as: 'roles'
        }
      ],
      limit: 1
    }).then(function(members) {
        if (!members || members.length == 0) 
          return next(
            new Error(
              "Can't find the info of member: " 
              + account_id + " in project: " + project_id
          ));
        res.locals.current_member = members[0];
        res.locals.editable = true;
        return next();
      }, function(error) {
          return next(error);
      });
  },
  function (req, res, next) {
    var member = res.locals.current_member;
    var SecurityLevel = req.models.security_level;
    var Role = req.models.role;
    var data = req.body;

    var onEditError = function(error) {
      SecurityLevel.findAll().then(function(security_levels){
        Role.findAll().then(function(roles){
            member.roles = member.previous('roles');
            res.render('member_view', {
              member: member,
              roles: roles,
              security_levels: security_levels,
              error: error
            }); 
          }, function(error){
            return next(error);
          });
        }, function(error){
          return next(error);
        });
    }

    member.update(data)
      .then(function(member) {
          member.setRoles(data.roles).then(
            function(roles) {
              res.redirect('/projects/' + member.project_id +
              '/member/' + member.account_id);
            }, onEditError);
        }, onEditError);
  }
);
//--------------------------------------------------------

//------------------- Owner section ----------------------
router.get('/edit/:id',
  function(req, res, next) {
    if (!res.locals.authenticated)
      return util.handle_unauthorized(next);

    var Project = req.models.project;
    var project_id = req.params.id;
    Project.findById(project_id)
      .then(function(project) {
          if (!project) 
            return next(new Error("Can't find the project with id: " + req.params.id));
          if (project.owner_id != res.locals.current_account.id)
            return util.handle_unauthorized(next);

          res.locals.current_project = project;
          return next();
      }, function(error) {
          return next(error);
      });
  },
  function(req, res, next) {
    var project = res.locals.current_project;
    res.render('edit', {
      project: project
    }); 
  }
);

router.post('/update',
  function(req, res, next) {
    if (!req.body) return next(new Error('Cannot get the req.body'));
    if (!res.locals.authenticated)
      return util.handle_unauthorized(next);

    var Project = req.models.project;
    var data = req.body;
    var project_id = data.id;
    Project.findById(project_id)
      .then(function(project) {
          if (!project) 
            return next(new Error("Can't find the project with id: " + req.params.id));
          if (project.owner_id != res.locals.current_account.id)
            return util.handle_unauthorized(next);

          res.locals.current_project = project;
          return next();
      }, function(error) {
          return next(error);
      });
  },
  function(req, res, next) {
    var project = res.locals.current_project;
    var data = req.body;
    delete data.id;
    project.update(data)
      .then(function(account) {
        res.redirect('/projects/' + project.id);
      }, function (error) {
        res.render('edit', {
          project: project,
          error: error
        }); 
      });
  }
);

router.post('/:id/addAccount',
  function(req, res, next) {
    if (!req.body) return next(new Error('Cannot get the req.body'));
    if (!res.locals.authenticated)
      return util.handle_unauthorized(next);

    var Project = req.models.project;
    var project_id = req.params.id;
    Project.findById(project_id)
      .then(function(project) {
          if (!project) 
            return next(new Error("Can't find the project with id: " + req.params.id));
          if (project.owner_id != res.locals.current_account.id)
            return util.handle_unauthorized(next);

          res.locals.current_project = project;
          return next();
      }, function(error) {
          return next(error);
      });
  },
  function(req, res, next) {
    var project = res.locals.current_project;
    var Account = req.models.account;
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
  }
);

// TODO: After front-end implement AngularJs, this should be
// switch to post
router.get('/:id/remove_account/:account_id',
  function(req, res, next) {
    if (!req.body) return next(new Error('Cannot get the req.body'));
    if (!res.locals.authenticated)
      return util.handle_unauthorized(next);

    var Project = req.models.project;
    var project_id = req.params.id;
    Project.findById(project_id)
      .then(function(project) {
          if (!project) 
            return next(new Error("Can't find the project with id: " + req.params.id));
          if (project.owner_id != res.locals.current_account.id)
            return util.handle_unauthorized(next);

          res.locals.current_project = project;
          return next();
      }, function(error) {
          return next(error);
      });
  },
  function(req, res, next) {
    var project = res.locals.current_project;
    var Account = req.models.account;
    var account_id = req.params.account_id;
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
  }
);

router.get('/delete/:id',
  function(req, res, next) {
    if (!req.body) return next(new Error('Cannot get the req.body'));
    if (!res.locals.authenticated)
      return util.handle_unauthorized(next);

    var Project = req.models.project;
    var project_id = req.params.id;
    Project.findById(project_id)
      .then(function(project) {
          if (!project) 
            return next(new Error("Can't find the project with id: " + req.params.id));
          if (project.owner_id != res.locals.current_account.id)
            return util.handle_unauthorized(next);

          res.locals.current_project = project;
          return next();
      }, function(error) {
          return next(error);
      });
  },
  function(req, res, next) {
    var project = res.locals.current_project;
    project.destroy()
      .then(function(deleteds){
          res.redirect("/projects");
        }, 
        function(error){
          return next(error);
      });
  }
);
//--------------------------------------------------------

//----------------- Authenticated section --------------------
// OPT: only show projects if acc is owner or member
router.get('/', 
  function(req, res, next) {
    if (!res.locals.authenticated) return util.handle_unauthorized(next);
    next();
  },
  function(req, res, next) {
    var Project = req.models.project;
    Project.findAll()
      .then(function(projects){
          res.render("list", {projects: projects});
        }, 
        function(error){
          return next(error);
      });
  }
);

router.get('/create', 
  function(req, res, next) {
    if (!res.locals.authenticated) return util.handle_unauthorized(next);
    next();
  },
  function(req, res, next) {
    res.render("create");
  }
);

router.post('/create', 
  function(req, res, next) {
    if (!res.locals.authenticated) return util.handle_unauthorized(next);
    if (!req.body) return next(new Error('Cannot get the req.body'));
    next();
  },
  function(req, res, next) {
    var data = req.body;
    var Project = req.models.project;
    var current_account = res.locals.current_account;

    Project.create(data)
      .then(function(project){
        current_account.addOwnedProject(project);
        current_account.addProject(project);
        return res.redirect('/projects/' + project.id);
      }, function(error){
        return res.render("create", {
          error: error
        });
      });
  }
);

// NOTE: owner and members can access
// but only admin can edit it.
router.get('/:id/member/:account_id', 
  function(req, res, next) {
    if (!res.locals.authenticated)
      return util.handle_unauthorized(next);

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
        req.models.project,
        {
          model: req.models.role,
          as: 'roles'
        }
      ],
      limit: 1
    }).then(function(members) {
        if (!members || members.length == 0) 
          return next(
            new Error(
              "Can't find the info of member: " 
              + account_id + " in project: " + project_id
          ));
        var member = members[0];

        if (res.locals.isAdmin) {
          res.locals.current_member = member;
          res.locals.editable = true;
          return next();
        }

        if (member.project.owner_id == res.locals.current_account.id) {
          res.locals.current_member = member;
          return next();
        }

        res.locals.current_account.has_project(req.params.id, function(result) {
          if (!result) return util.handle_unauthorized(next);
          res.locals.current_member = member;
          return next();
        });
      }, function(error) {
          return next(error);
      });
  },
  function (req, res, next) {
    var member = res.locals.current_member;
    var SecurityLevel = req.models.security_level;
    var Role = req.models.role;

    SecurityLevel.findAll().then(function(security_levels){
      Role.findAll().then(function(roles){
          res.render('member_view', {
            member: member,
            roles: roles,
            security_levels: security_levels
          }); 
        }, function(error){
          return next(error);
        });
      }, function(error){
        return next(error);
      });
  }
);

// NOTE: owner and members can access
router.get('/:id', 
  function(req, res, next) {
    if (!res.locals.authenticated)
      return util.handle_unauthorized(next);

    var Project = req.models.project;
    var project_id = req.params.id;
    Project.findById(project_id)
      .then(function(project) {
          if (!project) 
            return next(new Error("Can't find the project with id: " + req.params.id));
          if (res.locals.isAdmin || project.owner_id == res.locals.current_account.id) {
            res.locals.current_project = project;
            return next();
          }

          res.locals.current_account.has_project(req.params.id, function(result) {
            if (!result) return util.handle_unauthorized(next);
            res.locals.current_project = project;
            next();
          });
      }, function(error) {
          return next(error);
      });
  },
  function (req, res, next) {
    var project = res.locals.current_project;
    var AccountProject = req.models.account_project;
    AccountProject.findAll({
      where: {
        project_id: project.id
      },
      include: [
        {
          model: req.models.account, 
          as: 'account'
        },
        {
          model: req.models.role,
          as: 'roles'
        },
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
  }
);
//--------------------------------------------------------

module.exports = router;
