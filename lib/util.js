var util = (function() {
  var handle_unauthorized = function(next, custom_msg) {
    var msg = custom_msg || 'You are not permitted to do this!';
    var err = new Error(msg);
    err.status = 401;
    next(err);
  }

  return {
    handle_unauthorized: handle_unauthorized
  };
})();

module.exports = util;
