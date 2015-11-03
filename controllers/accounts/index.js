var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  var Account = req.models.account;
  Account.find(function (err, accounts) {
    if (err) return next(err);
    console.log(accounts);
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
  Account.create(data, function (err, newAcc) {
    if (err) return next(err);
    res.redirect('/accounts/view/' + newAcc.id);
  });
});

router.get('/view/:id', function (req, res, next) {
  var Account = req.models.account;
  Account.get(req.params.id, function(err, account) {
    if (err) return next(err);
    res.render('view', {account: account});
  });
});

module.exports = router;
