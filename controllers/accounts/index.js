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

module.exports = router;
