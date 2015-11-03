var fs = require('fs');
var path = require('path');
var orm      = require('orm');
var settings = require('../settings');

function setup(db) {
  // Uncomment these lines to import all models
  fs.readdirSync(__dirname + '/../models').forEach(function(name){
    if (path.extname(name) === '.js') {
      console.log('\nLoading model %s:', name);
      var model = require('./../models/' + name);
      model(orm, db);
    }
  });
}

(function () {
  orm.connect(settings[process.env.NODE_ENV].database, function (err, db) {
    if (err) return cb(err);

    db.settings.set('instance.returnAllErrors', true);
    setup(db);

    //db.drop();
    db.sync(function(){
    });
  });
})();
