var models = require('./../models');

module.exports = function (req, res, next) {
  req.models = models;
  return next();
};
