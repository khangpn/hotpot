var util = (function() {
  var handle_unauthorized = function(next) {
    var err = new Error('You are not permitted to do this!');
    err.status = 401;
    next(err);
  }

  return {
    handle_unauthorized: handle_unauthorized
  };
})();

module.exports = util;
