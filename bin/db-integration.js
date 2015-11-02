var fs = require('fs');
var orm      = require('orm');
var settings = require('../settings');

function setup(db) {
  // Uncomment this to import all models
  //fs.readdirSync(__dirname + '/../models').forEach(function(name){
  //  console.log('\nLoading model %s:', name);
  //  var model = require('./../models/' + name);
  //  model(orm, db);
  //});

  // Comment this when finish all models
  var model = require('./../models/account');
  model(orm, db);
}

(function () {
  orm.connect(settings[process.env.NODE_ENV].database, function (err, db) {
    if (err) return cb(err);

    db.settings.set('instance.returnAllErrors', true);
    setup(db);

    //db.drop();
    db.sync(function(){
      // This is for testing
      //db.models.account.create([
      //  {
      //    name: 'khang',
      //    password: 'khangnguyen',
      //  }
      //], function (err, items){
      //  if (err) return console.log(err);
      //});
    });
  });
})();
