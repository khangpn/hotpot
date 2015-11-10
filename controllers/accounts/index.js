var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  var Account = req.models.account;
  Account.findAll()
    .then(function(accounts){
        res.render("list", {accounts: accounts});
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
  var Account = req.models.account;

  Account.create(data)
    .then(function(newAcc){
      res.redirect('/accounts/view/' + newAcc.id);
    }, function(error){
      return res.render("create", {
        error: error
      });
    });
});

router.post('/update', function(req, res, next) {
});

router.post('/updateDetail/:id', function(req, res, next) {
  var data = req.body;
  var Account = req.models.account;
  var AccountDetail = req.models.account_detail;

  Account.findById(req.params.id, {include: req.models.account_detail})
    .then(function(account){
        var detail = account.account_detail;

        var handleSuccess = function () {
          res.redirect('/accounts/view/' + account.id);
        }

        var handleError = function (account, error) {
           return res.render("view", {
             account: account,
             error: error
           });
        }

        if (detail) {
          detail.update(data).then(
            function(detail) {
              handleSuccess();
            },
            function(error) {
              handleError(account, error);
            }
          );
        } else {
          data.accountId = account.id;
          AccountDetail.create(data)
            .then(function(newAccDetail){
              handleSuccess();
            }, function(error){
              handleError(account, error);
            });
        }
      }, 
      function(error){
        return next(error);
      }
    );
});

router.get('/view/:id', function (req, res, next) {
  var Account = req.models.account;
  Account.findById(req.params.id, {include: req.models.account_detail})
    .then(function(account) {
        res.render('view', {account: account}); 
      }, 
      function(error) {
        return next(error);
    });
});

module.exports = router;
