var express = require('express');
var router = express.Router();
var util = require('../../lib/util.js');

//------------------- Admin Section ----------------------
//--------------------------------------------------------

//------------------- Owner section ----------------------
router.get('/delete/:id',
  function(req, res, next) {
    if (!res.locals.authenticated) return util.handle_unauthorized(next);
    var article_id = req.params.id;
    var Article = req.models.article;
    Article.findById(req.params.id)
      .then(function(article){
          if (!article) return next(new Error("Can't find the article with id: " + req.params.id));
          if (article.account_id !== res.locals.current_account.id) 
            return util.handle_unauthorized(next);
          res.locals.current_article = article;
          return next()
        }, 
        function(error){
          return next(error);
      });
  },
  function(req, res, next) {
    var article = res.locals.current_article;
    var project_id = article.project_id;
    article.destroy()
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
var verify_edit_permission = function(req, res, next) {
  var article_id = res.locals.article_id;
  var Article = req.models.article;
  var SecurityLevel = req.models.security_level;
  var Role = req.models.role;
  var Project = req.models.project;
  var current_account = res.locals.current_account;
  Article.findById(article_id, {
    include: [SecurityLevel, Project, 
      {
        model: Role,
        as: 'roles'
      }
    ]
  })
    .then(function(article) {
        if (!article) return next(new Error("Can't find the article with id: " + article_id));
        current_account.getProjectProfiles({
          where: {
            project_id: article.project.id
          },
          include: [SecurityLevel],
          limit: 1
        }).then(
          function(project_profiles) {
            if (project_profiles.length > 0) {
              var project_profile = project_profiles[0];
              // NOTE: if user is owner or the aritcle is open for writing and the account's level equals to article's
              if (project_profile.security_level &&
                (
                  (
                    article.readable &&
                    article.writable &&
                    project_profile.security_level.level ==
                    article.security_level.level
                  ) || (
                    article.account_id == current_account.id &&
                    project_profile.security_level.level <=
                    article.security_level.level
                  )
                )
              ) {
                res.locals.current_profile = project_profile;
                res.locals.current_article = article;
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
}

/*
* NOTE: if user is owner or
* the aritcle is open for writing and the account's level equals to article's
*/
router.get('/edit/:id',
  function(req, res, next) {
    if (!res.locals.authenticated) return util.handle_unauthorized(next);
    res.locals.article_id = req.params.id;
    next();
  },
  verify_edit_permission,
  function(req, res, next) {
    var article = res.locals.current_article;
    var project_profile= res.locals.current_profile ;
    var SecurityLevel = req.models.security_level;
    var Role = req.models.role;
    SecurityLevel.findAll(
      { where: {
          level: { $gte: project_profile.security_level.level }
      } }
    ).then(function(security_levels){
      Role.findAll().then(function(roles){
          res.render('edit', {
            article: article,
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

router.post('/update',
  function(req, res, next) {
    if (!res.locals.authenticated) return util.handle_unauthorized(next);
    if (!req.body) return next(new Error('Cannot get the req.body'));
    var data = req.body;
    if (!data.roles || data.roles.length == 0) return next(new Error('Article should have at least one role'));
    res.locals.article_id = data.id;
    next();
  },
  verify_edit_permission,
  function verify_changed_sl(req, res, next) {
    var SecurityLevel = req.models.security_level;
    var article = res.locals.current_article;
    var project_profile= res.locals.current_profile ;
    var data = req.body;

    // the article security_level is changed
    if (data.security_level_id != article.security_level.id) {
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
    // the article security_level is NOT changed
    } else {
      return next();
    }
  },
  function(req, res, next) {
    var Article = req.models.article;
    var Role = req.models.role;
    var SecurityLevel = req.models.security_level;
    var article = res.locals.current_article;
    var project_profile= res.locals.current_profile ;
    var data = req.body;

    if (!data.is_directory || data.is_directory == false)
      data.is_directory = false;
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
              article.roles = article.previous('roles');
              res.render('edit', {
                article: article,
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

    delete data.id;
    article.update(data)
      .then(function(article) {
        var set_roles = function(article, roles) {
          article.setRoles(roles).then(
            function(roles) {
              res.redirect('/articles/' + article.id);
          }, onEditError);
        }

        if (!article.is_directory) {
          article.setArticles([]).then (
            function(articles) {
              set_roles(article, data.roles);
          }, onEditError);
        } else {
          set_roles(article, data.roles);
        }
      }, onEditError);
  }
);

var verify_directory_security_create = function(req, res, next) {
  var Article = req.models.article;
  var SecurityLevel = req.models.security_level;
  var Project = req.models.project;
  var Role = req.models.role;
  var Account = req.models.account;
  var current_account = res.locals.current_account;
  var directory_id = res.locals.current_directory_id;

  Article.findById(directory_id, {
    include: [SecurityLevel, Project, Account,
      {
        model: Role,
        as: 'roles'
      }
    ],
    where: {
      is_directory: true
    }
  }).then(
    function(directory) {
      if (!directory)
        return next(new Error("Can't find the directory with id: " + data.directory_id));

    current_account.getProjectProfiles({
      where: {
        project_id: directory.project_id
      },
      include: [SecurityLevel, Project,
        {
          model: Role,
          as: 'roles'
        }
      ],
      limit: 1
    }).then(
      function(project_profiles) {
        if (project_profiles.length > 0) {
          var project_profile = project_profiles[0];
          // NOTE: if user is owner or the aritcle is open for writing and the account's level equals to directory's
          if (project_profile.security_level &&
            (
              (
                directory.readable &&
                directory.writable &&
                project_profile.security_level.level ==
                directory.security_level.level
              ) || (
                directory.account_id == current_account.id &&
                project_profile.security_level.level <=
                directory.security_level.level
              )
            )
          ) {
            res.locals.current_profile = project_profile;
            res.locals.current_directory = directory;
            return next();
          }
          return util.handle_unauthorized(next);
        }
        return util.handle_unauthorized(next, 'This account does not belong to this project');
      }, function(error) {
        return next(error);
      });
    }, function(error) {
      return next(error);
    }
  );
}

var verify_directory_roles_create = function (req, res, next) {
  var directory = res.locals.current_directory;
  var current_account = res.locals.current_account;
  if (directory.account.id == current_account.id) {
    return next();
  }

  var project_profile = res.locals.current_profile;
  var article_roles = directory.roles;
  var profile_roles = project_profile.roles;

  var article_roles_array = [];
  for (var i = 0; i < article_roles.length; i++) {
    article_roles_array.push(article_roles[i].id);
  }
  article_roles_array.sort();

  var profile_roles_array = [];
  for (var i = 0; i < profile_roles.length; i++) {
    profile_roles_array.push(profile_roles[i].id);
  }
  profile_roles_array.sort();

  var result = util.array_inter(article_roles_array, 
    profile_roles_array);

  if (result.length == 0)
    return util.handle_unauthorized(next);

  return next();
}

// NOTE: permitted
// - user is owner
// - or the user is a member of the project
//and the directory is open for writing and the account's level equals to directory's
//and one of the member' roles in the project matches the directory's
// NOTE: article's security is gte to the directory's
// NOTE: article's roles are only one of the directory's
// NOTE: not support nested directory at the moment
router.get('/directory/:directory_id/create',
  function(req, res, next) {
    if (!res.locals.authenticated) return util.handle_unauthorized(next);
    res.locals.current_directory_id = req.params.directory_id;
    next();
  },
  verify_directory_security_create,
  verify_directory_roles_create,
  function(req, res, next) {
    var SecurityLevel = req.models.security_level;
    var Role = req.models.role;
    var project_profile= res.locals.current_profile ;
    var directory = res.locals.current_directory ;
    SecurityLevel.findAll(
      { where: {
          level: { 
            $and: {
              $gte: project_profile.security_level.level,
              $gte: directory.security_level.level,
            }
          }
      } }
    ).then(function(security_levels){
        res.render("create", {
          directory: directory,
          roles: directory.roles,
          security_levels: security_levels
        }); 
      }, function(error){
        return next(error);
      });
  }
);

// NOTE: the current_profile s_level should be lte to the article's in order to create it
// NOTE: not support nested directory at the moment
router.post('/directory/:directory_id/create',
  function(req, res, next) {
    if (!res.locals.authenticated) return util.handle_unauthorized(next);
    if (!req.body) return next(new Error('Cannot get the req.body'));
    var data = req.body;
    if (!data.roles || data.roles.length == 0) return next(new Error('Article should have at least one role'));
    if (!data.directory_id) return next(new Error('The directory ID is missing'));
    res.locals.current_directory_id = req.params.directory_id;
    next();
  },
  verify_directory_security_create,
  verify_directory_roles_create,
  function(req, res, next) {
    var Article = req.models.article;
    var project_profile= res.locals.current_profile ;
    var directory = res.locals.current_directory ;
    var data = req.body;
    data.account_id = res.locals.current_account.id; 
    data.directory_id = directory.id;
    data.project_id = directory.project_id;

    var onCreateError = function(error) {
      var SecurityLevel = req.models.security_level;
      SecurityLevel.findAll(
      { where: {
          level: { 
            $and: {
              $gte: project_profile.security_level.level,
              $gte: directory.security_level.level,
            }
          }
      } }
      ).then(function(security_levels){
          res.render("create", {
            project_id: data.project_id,
            roles: directory.roles,
            security_levels: security_levels,
            error: error
          }); 
        }, function(error){
          return next(error);
        });
    }

    Article.create(data)
      .then(function(article){
        article.setRoles(data.roles).then(
          function(roles) {
            res.redirect('/articles/' + article.id);
        });
      }, onCreateError);
  }
);

// NOTE: only show the article whose level is lte to current user level
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
            return next(new Error('This account doesnot have security level in this project yet!'));
          if (project_profile.roles.length == 0)
            return next(new Error('This account doesnot have any roles in this project yet!'));
          res.locals.current_profile = project_profile;
          return next();
        }
        return util.handle_unauthorized(next, 'This account does not belong to this project');
      }, function(error) {
        return next(error);
      });
  },
  function(req, res, next) {
    var SecurityLevel = req.models.security_level;
    var Article = req.models.article;
    var project_profile = res.locals.current_profile;
    var sequelize = req.models.sequelize;

    var account_roles_query = '';
    var account_roles = project_profile.roles;
    for (var i = 0; i < account_roles.length; i++) {
      account_roles_query += account_roles[i].id.toString();
      if (i < account_roles.length - 1)
        account_roles_query += ', ';
    }
    
    var query_string = 'SELECT "article"."id", "article"."name", "article"."description", "article"."content", "article"."writable", "article"."readable", "article"."created_at", "article"."updated_at", "article"."account_id", "article"."project_id", "article"."security_level_id",' +
    '"security_level"."id" AS "security_level.id", "security_level"."name" AS "security_level.name", "security_level"."level" AS "security_level.level", "security_level"."description" AS "security_level.description", "security_level"."created_at" AS "security_level.created_at", "security_level"."updated_at" AS "security_level.updated_at"' +
    //', "role".id AS "role.id", "role".name AS "role.name", "role".description AS "role.description"' +
    ' FROM "article" AS "article"' +
    ' INNER JOIN "security_level" AS "security_level" ON "article"."security_level_id" = "security_level"."id" AND ("security_level"."level" <= :level OR "article"."account_id" = :account_id)' +
    ' INNER JOIN "article_role" AS "article_role" ON "article"."id" = "article_role"."article_id"' +
    ' INNER JOIN "role" AS "role" ON "article_role"."role_id" = "role"."id"' +
    /* 
    * TODO: The account_roles_query should be replaced by replacement, but Sequelize does not support escapeValues yet.
    * Check this to see their progress https://github.com/sequelize/sequelize/issues/3769
    */
    //' WHERE ("article"."project_id" = :project_id AND (("article"."readable" = true AND "article_role"."role_id" IN (:account_roles_query)) OR "article"."account_id" = :account_id))' +
    ' WHERE ("article"."project_id" = :project_id AND (("article"."readable" = true AND "article_role"."role_id" IN (' +
    account_roles_query + ')) OR "article"."account_id" = :account_id))' +
    ' GROUP BY "article"."id", "security_level.id", "article_role"."article_id"';
    //'';
    sequelize.query(query_string, {
      replacements: {
        level: project_profile.security_level.level,
        account_id: project_profile.account_id,
        //account_roles_query: account_roles_query,
        project_id: project_profile.project_id
      },
      //escapeValues: false,// not escape the variables in query string
      type: sequelize.QueryTypes.SELECT
    })
    .then(
      function(articles) {
        res.render("list", {articles: articles});
      }, function(error) {
        return next(error);
      });
  }
);
//--------------------------------------------------------

//----------------- Authenticated section --------------------
// NOTE: if the user is a member of the project
// the user can only create article whose security_level is gte to his
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
          if (!project_profile.security_level)
            return next(new Error('This account doesnot have security level in this project yet!'));
          res.locals.current_profile = project_profile;
          return next();
        }
        return util.handle_unauthorized(next, 'This account does not belong to this project');
      }, function(error) {
        return next(error);
      });
  },
  function(req, res, next) {
    var SecurityLevel = req.models.security_level;
    var Role = req.models.role;
    var project_profile= res.locals.current_profile ;
    SecurityLevel.findAll(
      { where: {
          level: { $gte: project_profile.security_level.level }
      } }
    ).then(function(security_levels){
      Role.findAll().then(function(roles){
          res.render("create", {
            project_id: req.params.project_id,
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

// NOTE: the current_profile s_level should be lte to the article's in order to create it
router.post('/project/:project_id/create',
  function(req, res, next) {
    if (!res.locals.authenticated) return util.handle_unauthorized(next);
    if (!req.body) return next(new Error('Cannot get the req.body'));
    var SecurityLevel = req.models.security_level;
    var Project = req.models.project;
    var current_account = res.locals.current_account;
    var data = req.body;
    if (!data.roles || data.roles.length == 0) return next(new Error('Article should have at least one role'));
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
            if (!security_level)
              return next(new Error("Can't find the security with id: " + data.security_level_id));
            if (!project_profile.security_level)
              return next(new Error('This account doesnot have security level in this project yet!'));
            if (project_profile.security_level.level <= security_level.level) {
              res.locals.current_profile = project_profile;
              return next();
            }
            return util.handle_unauthorized(next);
          }, function(error) {
            return next(error);
          });
        } else {
          return util.handle_unauthorized(next, 'This account does not belong to this project');
        }
      }, function(error) {
        return next(error);
      });
  },
  function(req, res, next) {
    var Article = req.models.article;
    var project_profile= res.locals.current_profile ;
    var data = req.body;
    data.account_id = res.locals.current_account.id; 

    Article.create(data)
      .then(function(article){
        article.setRoles(data.roles).then(
          function(roles) {
            res.redirect('/articles/' + article.id);
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
                res.render("create", {
                  project_id: data.project_id,
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
      });
  }
);

// NOTE: the current_profile s_level should be gte to the article's in order to view it
router.get('/:id',
  function(req, res, next) {
    if (!res.locals.authenticated) return util.handle_unauthorized(next);
    var SecurityLevel = req.models.security_level;
    var Article = req.models.article;
    var Role = req.models.role;
    var Project = req.models.project;
    var current_account = res.locals.current_account;
    var article_id = req.params.id;
    var account = res.locals.current_account;

    Article.findById(article_id, {
      include: [
        req.models.account, 
        req.models.security_level, 
        req.models.project,
        {
          model: Role,
          as: 'roles'
        }
      ]
    }).then(function(article) {
          if (!article) return next(new Error("Can't find the article with id: " + req.params.id));
          if (article.account.id == current_account.id) {
            res.locals.current_article = article;
            return next();
          }
          if (article.readable) {
            current_account.getProjectProfiles({
              where: {
                project_id: article.project_id
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
                    article.security_level.level) {
                    res.locals.current_article = article;
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
    var article = res.locals.current_article;
    var current_account = res.locals.current_account;
    if (article.account.id == current_account.id) {
      res.locals.current_article = article;
      return next();
    }

    var project_profile = res.locals.current_profile;
    var article_roles = article.roles;
    var profile_roles = project_profile.roles;

    var article_roles_array = [];
    for (var i = 0; i < article_roles.length; i++) {
      article_roles_array.push(article_roles[i].id);
    }
    article_roles_array.sort();

    var profile_roles_array = [];
    for (var i = 0; i < profile_roles.length; i++) {
      profile_roles_array.push(profile_roles[i].id);
    }
    profile_roles_array.sort();

    var result = util.array_inter(article_roles_array, 
      profile_roles_array);

    if (result.length == 0)
      return util.handle_unauthorized(next);
    return next();
  },
  function (req, res, next) {
    var article = res.locals.current_article;
    res.render('view', {
      article: article,
      roles: article.roles
    }); 
  }
);
//--------------------------------------------------------

module.exports = router;
