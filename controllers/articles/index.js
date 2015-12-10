var express = require('express');
var router = express.Router();

//------------------- Admin Section ----------------------
//--------------------------------------------------------

//------------------- Owner section ----------------------
//Permitted user can edit if the article is writable
router.get('/edit/:id', function(req, res, next) {
  var Article = req.models.article;
  var SecurityLevel = req.models.security_level;
  Article.findById(req.params.id)
    .then(function(article) {
        if (!article) return next(new Error("Can't find the article with id: " + req.params.id));
        SecurityLevel.findAll()
          .then(function(security_levels){
            res.render('edit', {
              article: article,
              security_levels: security_levels
            }); 
          }, function(error){
            return next(error);
          });
      }, 
      function(error) {
        return next(error);
    });
});

//Permitted user can update if the article is writable
router.post('/update', function(req, res, next) {
  if (!req.body) return next(new Error('Cannot get the req.body'));

  var data = req.body;
  var Article = req.models.article;
  var SecurityLevel = req.models.security_level;

  Article.findById(data.id)
    .then(function(article) {
        if (!article) return next(new Error("Can't find the article with id: " + req.params.id));
        delete data.id;
        article.update(data)
          .then(function(account) {
            res.redirect('/articles/' + article.id);
          }, function (error) {
            SecurityLevel.findAll()
              .then(function(security_levels){
                res.render('edit', {
                  article: article,
                  security_levels: security_levels,
                  error: error
                }); 
              }, function(error){
                return next(error);
              });
          }
        );
      }, 
      function(error) {
        return next(error);
      }
    );
});

router.get('/delete/:id', function(req, res, next) {
  var Article = req.models.article;
  Article.findById(req.params.id)
    .then(function(article){
        if (!article) return next(new Error("Can't find the article with id: " + req.params.id));
        var project_id = article.project_id;
        article.destroy()
          .then(function(){
            res.redirect("/projects/" + project_id);
            }, 
            function(error){
              return next(error);
          });
      }, 
      function(error){
        return next(error);
    });
});
//--------------------------------------------------------

//------------------- Permitted section ----------------------
router.get('/project/:project_id', function(req, res, next) {
  var Article = req.models.article;
  Article.findAll({
    where: { project_id: req.params.project_id}
    })
    .then(function(articles){
        res.render("list", {articles: articles});
      }, 
      function(error){
        return next(error);
    });
});

//--------------------------------------------------------

//----------------- Authenticated section --------------------
router.get('/project/:project_id/create', function(req, res, next) {
  var SecurityLevel = req.models.security_level;
  //NOTE:filter the security_level upon account's level
  SecurityLevel.findAll()
    .then(function(security_levels){
      res.render("create", {
        project_id: req.params.project_id,
        security_levels: security_levels
      });
    }, function(error){
      return next(error);
    });
});

router.post('/project/:project_id/create', function(req, res, next) {
  if (!req.body) return next(new Error('Cannot get the req.body'));

  var data = req.body;
  data.account_id = res.locals.current_account.id; 

  console.log(data);
  var Article = req.models.article;

  Article.create(data)
    .then(function(newArticle){
      res.redirect('/articles/' + newArticle.id);
    }, function(error){
      console.log(error);
      var SecurityLevel = req.models.security_level;
      //NOTE:filter the security_level upon account's level
      SecurityLevel.findAll()
        .then(function(security_levels){
          res.render("create", {
            project_id: data.project_id,
            security_levels: security_levels,
            error: error
          });
        }, function(error){
          return next(error);
        });
    });
});

router.get('/:id', function (req, res, next) {
  var Article = req.models.article;
  var article_id = req.params.id;
  Article.findById(article_id, {
    include: [
      req.models.account, 
      req.models.security_level, 
      req.models.project
    ]
  })
    .then(function(article) {
        if (!article) return next(new Error("Can't find the article with id: " + req.params.id));

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
      }, 
      function(error) {
        return next(error);
    });
});
//--------------------------------------------------------

module.exports = router;
