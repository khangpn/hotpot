var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  var Account = req.models.account;
  Account.findAll()
    .error(function(error){
      return next(err);
    })
    .then(function(accounts){
      res.render("list", {accounts: accounts});
    });
});

router.get('/create', function(req, res, next) {
  res.render("create");
});

router.post('/create', function(req, res, next) {
  if (!req.body) return next(new Error('Cannot get the req.body'));

  console.log(req.body);
  var data = req.body;
  var Account = req.models.account;

  Account.create(data)
    .error(function(err){
      console.error(err);
      if (err) 
        return res.render("create", {
          error: err
        });
    })
    .then(function(newAcc){
      res.redirect('/accounts/view/' + newAcc.id);
    });
});

router.get('/view/:id', function (req, res, next) {
  var Account = req.models.account;
  Account.findById(req.params.id)
    .error(function(err){
      return next(err);
    })
    .then(function(account){
      res.render('view', {account: account});
    });
});

module.exports = router;
