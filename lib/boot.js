/**
 * Reference code from the Express MVC example
 * https://github.com/strongloop/express/tree/master/examples/mvc
 * Loading controller
 */

var express = require('express');
var fs = require('fs');

module.exports = function(parent, options){
  var verbose = options.verbose;
  fs.readdirSync(__dirname + '/../controllers').forEach(function(name){
    console.log('\nLoading controller   %s:', name);
    var controller = require('./../controllers/' + name);
    var subApp = express();

    // allow specifying the view engine
    if (controller.engine) subApp.set('view engine', controller.engine);
    subApp.set('views', __dirname + '/../controllers/' + name + '/views');
    subApp.use(controller);

    // mount the route
    if (name === 'main') {
      parent.use('/', subApp);
    } else {
      parent.use('/' + name, subApp);
    }
  });
};
