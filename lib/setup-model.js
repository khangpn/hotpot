var fs = require('fs');
var orm      = require('orm');
var settings = require('../settings');

var connection = null;
var verbose = process.env.NODE_ENV === 'development';

function setup(db) {
  fs.readdirSync(__dirname + '/../models').forEach(function(name){
    console.log('\nLoading model %s:', name);
    var model = require('./../models/' + name);
    model(orm, db);
  });
}

module.exports = function (req, res, next) {
  console.log('=================');
  if (!connection) {
    orm.connect(settings[process.env.NODE_ENV].database, function (err, db) {
      if (err) return cb(err);

      connection = db;
      //validate every property and return all validation errors
      db.settings.set('instance.returnAllErrors', true);
      setup(db);
    });
  }

  req.models = connection.models;
  req.db = connection;
  return next();
};
