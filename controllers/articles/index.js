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
          if (!article.account_id !== res.locals.current_account.id) 
            return util.handle_unauthorized(next);
          res.locals.current_article = article;
          next()
        }, 
        function(error){
          return next(error);
      });
  },
  function(req, res, next) {
    var project_id = article.project_id;
    var article = res.locals.article;
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
/*
* NOTE: Owner can edit his article as long as his level is
lower than its.
*/
router.get('/edit/:id',
  function(req, res, next) {
    if (!res.locals.authenticated) return util.handle_unauthorized(next);
    var article_id = req.params.id;
    var Article = req.models.article;
    var SecurityLevel = req.models.security_level;
    var Project = req.models.project;
    var current_account = res.locals.current_account;
    Article.findById(article_id, {
      include: [SecurityLevel, Project]
    })
      .then(function(article) {
          if (!article) return next(new Error("Can't find the article with id: " + req.params.id));
          // if user is owner or the aritcle is open for writing
          //if (article.writable || article.account_id == current_account.id) {
          // only owner can edit
          if (article.account_id == current_account.id) {
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
                  // if user level is lower than article level
                  if ( project_profile.security_level &&
                    project_profile.security_level.level <=
                    article.security_level.level) {
                    res.locals.current_profile = project_profile;
                    res.locals.current_article = article;
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
  function(req, res, next) {
    var article = res.locals.current_article;
    var project_profile= res.locals.current_profile ;
    var SecurityLevel = req.models.security_level;
    SecurityLevel.findAll(
      { where: {
          level: { $gte: project_profile.security_level.level }
      } }
    ).then(function(security_levels){
        res.render('edit', {
          article: article,
          security_levels: security_levels
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
    var article_id = data.id;
    var Article = req.models.article;
    var SecurityLevel = req.models.security_level;
    var Project = req.models.project;
    var current_account = res.locals.current_account;
    Article.findById(article_id, {
      include: [SecurityLevel, Project]
    })
      .then(function(article) {
          if (!article) return next(new Error("Can't find the article with id: " + req.params.id));
          // if user is owner or the aritcle is open for writing
          //if (article.writable || article.account_id == current_account.id) {
          // only owner can edit
          if (article.account_id == current_account.id) {
            current_account.getProjectProfiles({
              where: {
                project_id: article.project.id
              },
              include: [SecurityLevel],
              limit: 1
            }).then(
              function(project_profiles) {
                if (project_profiles.length > 0) {
                  // if user level is lower than article level
                  var project_profile = project_profiles[0];
                  if ( project_profile.security_level &&
                    project_profile.security_level.level <=
                    article.security_level.level) {
                    res.locals.current_profile = project_profile;
                    res.locals.current_article = article;
                    // the article security_level is changed
                    if (data.security_id != article.security_level.id) {
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
          } else {
            return util.handle_unauthorized(next);
          }
        }, 
        function(error) {
          return next(error);
      });
  },
  function(req, res, next) {
    var Article = req.models.article;
    var SecurityLevel = req.models.security_level;
    var article = res.locals.current_article;
    var project_profile= res.locals.current_profile ;
    var data = req.body;

    delete data.id;
    article.update(data)
      .then(function(account) {
        res.redirect('/articles/' + article.id);
      }, function (error) {
        SecurityLevel.findAll(
          { where: {
              level: { $gte: project_profile.security_level.level }
          } }
        ).then(function(security_levels){
            res.render('edit', {
              article: article,
              security_levels: security_levels,
              error: error
            }); 
          }, function(error){
            return next(error);
          });
      });
  }
);

// TODO: check account's roles
// NOTE: only show the article whose level is lte to current user level
router.get('/project/:project_id',
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
          res.locals.current_profile = project_profile;
          return next();
        }
        return util.handle_unauthorized(next);
      }, function(error) {
        return next(error);
      });
  },
  function(req, res, next) {
    var Article = req.models.article;
    var SecurityLevel = req.models.security_level;
    var project_profile = res.locals.current_profile;
    // TODO: edit query to select either the article whose security_level is lte to user's
    // OR the user is its owner
    Article.findAll({
      where: {
        $and: {
          project_id: project_profile.project_id,
          $or: [
            { readable: true },
            { account_id: project_profile.account_id }
          ]
        }
      },
      include: [{
        model: SecurityLevel
        where: {
          level: { $lte: project_profile.security_level.level }
        }
      }]
    }).then(
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
    var project_profile= res.locals.current_profile ;
    SecurityLevel.findAll(
      { where: {
          level: { $gte: project_profile.security_level.level }
      } }
    ).then(function(security_levels){
        res.render("create", {
          project_id: req.params.project_id,
          security_levels: security_levels
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
    var Article = req.models.article;
    var project_profile= res.locals.current_profile ;
    var data = req.body;
    data.account_id = res.locals.current_account.id; 

    Article.create(data)
      .then(function(newArticle){
        res.redirect('/articles/' + newArticle.id);
      }, function(error){
        var SecurityLevel = req.models.security_level;
        SecurityLevel.findAll(
          { where: {
              level: { $gte: project_profile.security_level.level }
          } }
        ).then(function(security_levels){
            res.render("create", {
              project_id: data.project_id,
              security_levels: security_levels,
              error: error
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
    var Project = req.models.project;
    var current_account = res.locals.current_account;
    var article_id = req.params.id;
    var account = res.locals.current_account;

    Article.findById(article_id, {
      include: [
        req.models.account, 
        req.models.security_level, 
        req.models.project
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
              include: [SecurityLevel, Project],
              limit: 1
            }).then(
              function(project_profiles) {
                if (project_profiles.length > 0) {
                  var project_profile = project_profiles[0];
                  if ( project_profile.security_level &&
                    project_profile.security_level.level >=
                    article.security_level.level) {
                    res.locals.current_article = article;
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
    article.getRoles()
      .then(function(roles) {
        res.render('view', {
          article: article,
          roles: roles
        }); 
      }, 
      function(error) {
        return next(error);
      });
  }
);
//--------------------------------------------------------

module.exports = router;
