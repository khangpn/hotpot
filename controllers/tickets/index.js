var express = require('express');
var router = express.Router();
var util = require('../../lib/util.js');

//------------------- Admin Section ----------------------
//--------------------------------------------------------

//------------------- Owner section ----------------------
router.get('/delete/:id',
  function(req, res, next) {
    if (!res.locals.authenticated) return util.handle_unauthorized(next);
    var ticket_id = req.params.id;
    var Ticket = req.models.ticket;
    Ticket.findById(req.params.id)
      .then(function(ticket){
          if (!ticket) return next(new Error("Can't find the ticket with id: " + req.params.id));
          if (ticket.owner_id !== res.locals.current_account.id) 
            return util.handle_unauthorized(next);
          res.locals.current_ticket = ticket;
          next()
        }, 
        function(error){
          return next(error);
      });
  },
  function(req, res, next) {
    var project_id = ticket.project_id;
    var ticket = res.locals.ticket;
    ticket.destroy()
      .then(function(){
        res.redirect("/projects/" + project_id);
        }, 
        function(error){
          return next(error);
      });
  }
);
//--------------------------------------------------------

//------------------- Permitted section ----------------------
/*
* NOTE: Owner can edit his ticket as long as his level is
lower than its.
*/
router.get('/edit/:id',
  function(req, res, next) {
    if (!res.locals.authenticated) return util.handle_unauthorized(next);
    var ticket_id = req.params.id;
    var Ticket = req.models.ticket;
    var SecurityLevel = req.models.security_level;
    var Role = req.models.role;
    var Project = req.models.project;
    var Priority = req.models.priority;
    var current_account = res.locals.current_account;
    Ticket.findById(ticket_id, {
      include: [SecurityLevel, Project, Priority,
        {
          model: Role,
          as: 'roles'
        }
      ]
    })
      .then(function(ticket) {
          if (!ticket) return next(new Error("Can't find the ticket with id: " + req.params.id));
          current_account.getProjectProfiles({
            where: {
              project_id: ticket.project.id
            },
            include: [SecurityLevel],
            limit: 1
          }).then(
            function(project_profiles) {
              if (project_profiles.length > 0) {
                var project_profile = project_profiles[0];
                // NOTE: if user is owner or the ticket is open for writing and the account's level equals to ticket's
                if (project_profile.security_level &&
                  (
                    (
                      ticket.writable &&
                      project_profile.security_level.level ==
                      ticket.security_level.level
                    ) || (
                      ticket.owner_id == current_account.id &&
                      project_profile.security_level.level <=
                      ticket.security_level.level
                    )
                  )
                ) {
                  res.locals.current_profile = project_profile;
                  res.locals.current_ticket = ticket;
                  return next();
                }
              }
              return util.handle_unauthorized(next);
            }, function(error) {
              return next(error);
            });
        }, 
        function(error) {
          return next(error);
      });
  },
  function(req, res, next) {
    var ticket = res.locals.current_ticket;
    var project_profile= res.locals.current_profile ;
    var SecurityLevel = req.models.security_level;
    var Role = req.models.role;
    var Priority = req.models.priority;
    SecurityLevel.findAll(
      { where: {
          level: { $gte: project_profile.security_level.level }
      } }
    ).then(function(security_levels){
      Role.findAll().then(function(roles){
        Priority.findAll().then(function(priorities){
            res.render("edit", {
              ticket: ticket,
              roles: roles,
              priorities: priorities,
              security_levels: security_levels
            }); 
          }, function(error){
            return next(error);
          });
        }, function(error){
          return next(error);
        });
      }, function(error){
        return next(error);
      });
  }
);

router.post('/update',
  function(req, res, next) {
    if (!res.locals.authenticated) return util.handle_unauthorized(next);
    if (!req.body) return next(new Error('Cannot get the req.body'));
    var data = req.body;
    if (!data.roles || data.roles.length == 0) return next(new Error('Ticket should have at least one role'));
    var ticket_id = data.id;
    var Ticket = req.models.ticket;
    var Role = req.models.role;
    var SecurityLevel = req.models.security_level;
    var Project = req.models.project;
    var Priority = req.models.priority;
    var current_account = res.locals.current_account;
    Ticket.findById(ticket_id, {
      include: [SecurityLevel, Project, Priority,
        {
          model: Role,
          as: 'roles'
        }
      ]
    })
      .then(function(ticket) {
          if (!ticket) return next(new Error("Can't find the ticket with id: " + req.params.id));
          current_account.getProjectProfiles({
            where: {
              project_id: ticket.project.id
            },
            include: [SecurityLevel],
            limit: 1
          }).then(
            function(project_profiles) {
              if (project_profiles.length > 0) {
                var project_profile = project_profiles[0];
                // NOTE: if user is owner or the aritcle is open for writing and the account's level equals to ticket's
                if (project_profile.security_level &&
                  (
                    (
                      ticket.writable &&
                      project_profile.security_level.level ==
                      ticket.security_level.level
                    ) || (
                      ticket.owner_id == current_account.id &&
                      project_profile.security_level.level <=
                      ticket.security_level.level
                    )
                  )
                ) {
                  res.locals.current_profile = project_profile;
                  res.locals.current_ticket = ticket;
                  // the ticket security_level is changed
                  if (data.security_id != ticket.security_level.id) {
                    SecurityLevel.findById(data.security_level_id)
                    .then(function(security_level) {
                      if (!security_level) 
                        return next(new Error("Can't find the security with id: " + data.security_level_id));
                      if ( project_profile.security_level &&
                        project_profile.security_level.level <=
                        security_level.level) {
                        return next();
                      }
                      return util.handle_unauthorized(next);
                    }, function(error) {
                      return next(error);
                    });
                  // the ticket security_level is NOT changed
                  } else {
                    return next();
                  }
                } else {
                  return util.handle_unauthorized(next);
                }
              } else {
                return util.handle_unauthorized(next);
              }
            }, function(error) {
              return next(error);
            });
        }, 
        function(error) {
          return next(error);
      });
  },
  function(req, res, next) {
    var Priority = req.models.priority;
    var Role = req.models.role;
    var SecurityLevel = req.models.security_level;
    var ticket = res.locals.current_ticket;
    var project_profile= res.locals.current_profile ;
    var data = req.body;

    if (!data.readable || data.readable == false)
      data.readable = false;
    if (!data.writable || data.writable == false)
      data.writable = false;

    var onEditError = function(error) {
      SecurityLevel.findAll(
        { where: {
            level: { $gte: project_profile.security_level.level }
        } }
      ).then(function(security_levels){
          Role.findAll().then(function(roles){
              //this is because the update failed will set
              //all roles object to empty data value, while
              // still remain the number of roles in the array
              ticket.roles = ticket.previous('roles');
              ticket.priority = ticket.previous('priority');
              Priority.findAll().then(function(priorities){
                  res.render('edit', {
                    ticket: ticket,
                    roles: roles,
                    priorities: priorities,
                    security_levels: security_levels,
                    error: error
                  }); 
                }, function(error){
                  return next(error);
                });
            }, function(error){
              return next(error);
            });
        }, function(error){
          return next(error);
        });
    }

    delete data.id;
    ticket.update(data)
      .then(function(ticket) {
        ticket.setRoles(data.roles).then(
          function(roles) {
            res.redirect('/tickets/' + ticket.id);
        }, onEditError);
      }, onEditError);
  }
);

// NOTE: only show the ticket whose level is lte to current user level
router.get('/project/:project_id',
  function(req, res, next) {
    if (!res.locals.authenticated) return util.handle_unauthorized(next);
    var SecurityLevel = req.models.security_level;
    var Project = req.models.project;
    var Role = req.models.role;
    var current_account = res.locals.current_account;
    var project_id = req.params.project_id;

    current_account.getProjectProfiles({
      where: {
        project_id: project_id
      },
      include: [SecurityLevel, Project,
        {
          model:Role,
          as: "roles"
        }
      ],
      limit: 1
    }).then(
      function(project_profiles) {
        if (project_profiles.length > 0) {
          var project_profile = project_profiles[0];
          if (!project_profile.security_level)
            return next(new Error('This account doesnot have security level for in project yet!'));
          res.locals.current_profile = project_profile;
          return next();
        }
        return util.handle_unauthorized(next);
      }, function(error) {
        return next(error);
      });
  },
  function(req, res, next) {
    var SecurityLevel = req.models.security_level;
    var Ticket = req.models.ticket;
    var project_profile = res.locals.current_profile;
    var sequelize = req.models.sequelize;

    var account_roles_query = '';
    var account_roles = project_profile.roles;
    for (var i = 0; i < account_roles.length; i++) {
      account_roles_query += account_roles[i].id.toString();
      if (i < account_roles.length - 1)
        account_roles_query += ',';
    }
    
    var query_string = 'SELECT "ticket"."id", "ticket"."name", "ticket"."content", "ticket"."due_date", "ticket"."writable", "ticket"."readable", "ticket"."created_at", "ticket"."updated_at", "ticket"."owner_id", "ticket"."assignee_id", "ticket"."project_id", "ticket"."security_level_id"' +
    ', "owner"."id" AS "owner.id", "owner"."name" AS "owner.name"' +
    ', "assignee"."id" AS "assignee.id", "assignee"."name" AS "assignee.name"' +
    ' FROM "ticket" AS "ticket"' +
    ' INNER JOIN "security_level" AS "security_level" ON "ticket"."security_level_id" = "security_level"."id" AND ("security_level"."level" <= :level OR "ticket"."owner_id" = :owner_id)' +
    ' INNER JOIN "ticket_role" AS "ticket_role" ON "ticket"."id" = "ticket_role"."ticket_id"' +
    ' INNER JOIN "role" AS "role" ON "ticket_role"."role_id" = "role"."id"' +
    ' INNER JOIN "account" AS "owner" ON "ticket"."owner_id" = "owner"."id"' +
    ' INNER JOIN "account" AS "assignee" ON "ticket"."assignee_id" = "assignee"."id"' +
    ' WHERE ("ticket"."project_id" = :project_id AND (("ticket"."readable" = true AND "ticket_role"."role_id" IN (:account_roles_query)) OR "ticket"."owner_id" = :owner_id))' +
    ' GROUP BY "ticket"."id", "ticket_role"."ticket_id", "owner.id", "assignee.id"';
    //'';
    sequelize.query(query_string, {
      replacements: {
        level: project_profile.security_level.level,
        owner_id: project_profile.account_id,
        account_roles_query: account_roles_query,
        project_id: project_profile.project_id
      },
      type: sequelize.QueryTypes.SELECT
    })
    .then(
      function(tickets) {
        res.render("list", {tickets: tickets});
      }, function(error) {
        return next(error);
      });
  }
);
//--------------------------------------------------------

//----------------- Authenticated section --------------------
// NOTE: if the user is a member of the project
// the user can only create ticket whose security_level is gte to his
router.get('/project/:project_id/create',
  function(req, res, next) {
    if (!res.locals.authenticated) return util.handle_unauthorized(next);
    var SecurityLevel = req.models.security_level;
    var Project = req.models.project;
    var current_account = res.locals.current_account;
    var project_id = req.params.project_id;

    current_account.getProjectProfiles({
      where: {
        project_id: project_id
      },
      include: [SecurityLevel, Project],
      limit: 1
    }).then(
      function(project_profiles) {
        if (project_profiles.length > 0) {
          var project_profile = project_profiles[0];
          if (project_profile.security_level) {
            res.locals.current_profile = project_profile;
            return next();
          }
        }
        return util.handle_unauthorized(next, 'This user has no security level');
      }, function(error) {
        return next(error);
      });
  },
  function(req, res, next) {
    var SecurityLevel = req.models.security_level;
    var Role = req.models.role;
    var Priority = req.models.priority;
    var project_profile= res.locals.current_profile ;
    SecurityLevel.findAll(
      { where: {
          level: { $gte: project_profile.security_level.level }
      } }
    ).then(function(security_levels){
      Role.findAll().then(function(roles){
        Priority.findAll().then(function(priorities){
            res.render("create", {
              project_id: req.params.project_id,
              roles: roles,
              priorities: priorities,
              security_levels: security_levels
            }); 
          }, function(error){
            return next(error);
          });
        }, function(error){
          return next(error);
        });
      }, function(error){
        return next(error);
      });
  }
);

// NOTE: the current_profile s_level should be lte to the ticket's in order to create it
router.post('/project/:project_id/create',
  function(req, res, next) {
    if (!res.locals.authenticated) return util.handle_unauthorized(next);
    if (!req.body) return next(new Error('Cannot get the req.body'));
    var SecurityLevel = req.models.security_level;
    var Project = req.models.project;
    var current_account = res.locals.current_account;
    var data = req.body;
    if (!data.roles || data.roles.length == 0) return next(new Error('Ticket should have at least one role'));
    var project_id = data.project_id;

    current_account.getProjectProfiles({
      where: {
        project_id: project_id
      },
      include: [SecurityLevel, Project],
      limit: 1
    }).then(
      function(project_profiles) {
        if (project_profiles.length > 0) {
          var project_profile = project_profiles[0];
          SecurityLevel.findById(data.security_level_id)
          .then(function(security_level) {
            if (!security_level) return next(new Error("Can't find the security with id: " + data.security_level_id));
            if (project_profile.security_level && 
              project_profile.security_level.level <= security_level.level) {
              res.locals.current_profile = project_profile;
              return next();
            }
            return util.handle_unauthorized(next);
          }, function(error) {
            return next(error);
          });
        } else {
          return util.handle_unauthorized(next);
        }
      }, function(error) {
        return next(error);
      });
  },
  function(req, res, next) {
    var Ticket = req.models.ticket;
    var Priority = req.models.priority;
    var project_profile= res.locals.current_profile ;
    var data = req.body;
    data.owner_id = res.locals.current_account.id; 
    data.assignee_id = res.locals.current_account.id; 

    Ticket.create(data)
      .then(function(ticket){
        ticket.setRoles(data.roles).then(
          function(roles) {
            res.redirect('/tickets/' + ticket.id);
        });
      }, function(error){
        var SecurityLevel = req.models.security_level;
        SecurityLevel.findAll(
          { where: {
              level: { $gte: project_profile.security_level.level }
          } }
        ).then(function(security_levels){
            var Role = req.models.role;
            Role.findAll().then(function(roles){
                Priority.findAll().then(function(priorities){
                    res.render("create", {
                      project_id: data.project_id,
                      roles: roles,
                      priorities: priorities,
                      security_levels: security_levels,
                      error: error
                    }); 
                  }, function(error){
                    return next(error);
                  });
              }, function(error){
                return next(error);
              });
          }, function(error){
            return next(error);
          });
      });
  }
);

// NOTE: the current_profile s_level should be gte to the ticket's in order to view it
router.get('/:id',
  function(req, res, next) {
    if (!res.locals.authenticated) return util.handle_unauthorized(next);
    var SecurityLevel = req.models.security_level;
    var Ticket = req.models.ticket;
    var Role = req.models.role;
    var Project = req.models.project;
    var current_account = res.locals.current_account;
    var ticket_id = req.params.id;
    var account = res.locals.current_account;

    Ticket.findById(ticket_id, {
      include: [
        {
          model: req.models.account, 
          as: 'owner'
        },
        {
          model: req.models.account, 
          as: 'assignee',
          require: false
        },
        req.models.security_level, 
        req.models.project,
        {
          model: Role,
          as: 'roles'
        }
      ]
    }).then(function(ticket) {
          if (!ticket) return next(new Error("Can't find the ticket with id: " + req.params.id));
          if (ticket.owner.id == current_account.id) {
            res.locals.current_ticket = ticket;
            return next();
          }
          if (ticket.readable) {
            current_account.getProjectProfiles({
              where: {
                project_id: ticket.project_id
              },
              include: [SecurityLevel, Project,
                {
                  model:Role,
                  as: 'roles'
                }
              ],
              limit: 1
            }).then(
              function(project_profiles) {
                if (project_profiles.length > 0) {
                  var project_profile = project_profiles[0];
                  if ( project_profile.security_level &&
                    project_profile.security_level.level >=
                    ticket.security_level.level) {
                    res.locals.current_ticket = ticket;
                    res.locals.current_profile = project_profile;
                    return next();
                  }
                }
                return util.handle_unauthorized(next);
              }, function(error) {
                return next(error);
              });
          } else {
            return util.handle_unauthorized(next);
          }
        }, 
        function(error) {
          return next(error);
      });
  },
  function (req, res, next) {
    var ticket = res.locals.current_ticket;
    var current_account = res.locals.current_account;
    if (ticket.owner.id == current_account.id) {
      res.locals.current_ticket = ticket;
      return next();
    }

    var project_profile = res.locals.current_profile;
    var ticket_roles = ticket.roles;
    var profile_roles = project_profile.roles;

    var ticket_roles_array = [];
    for (var i = 0; i < ticket_roles.length; i++) {
      ticket_roles_array.push(ticket_roles[i].id);
    }
    ticket_roles_array.sort();

    var profile_roles_array = [];
    for (var i = 0; i < profile_roles.length; i++) {
      profile_roles_array.push(profile_roles[i].id);
    }
    profile_roles_array.sort();

    var result = util.array_inter(ticket_roles_array, 
      profile_roles_array);

    if (result.length == 0)
      return util.handle_unauthorized(next);
    return next();
  },
  function (req, res, next) {
    var ticket = res.locals.current_ticket;
    res.render('view', {
      ticket: ticket,
      roles: ticket.roles
    }); 
  }
);
//--------------------------------------------------------

module.exports = router;
