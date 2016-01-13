var util = (function() {
  var handle_unauthorized = function(next, custom_msg) {
    var msg = custom_msg || 'You are not permitted to do this!';
    var err = new Error(msg);
    err.status = 401;
    return next(err);
  }

  var intersection_destructive = function (a, b) {
    var result = new Array();
    while( a.length > 0 && b.length > 0 )
    {  
       if      (a[0] < b[0] ){ a.shift(); }
       else if (a[0] > b[0] ){ b.shift(); }
       else /* they're equal */
       {
         result.push(a.shift());
         b.shift();
         }
      }

    return result;
  }

  return {
    handle_unauthorized: handle_unauthorized,
    array_inter: intersection_destructive
  };
})();

module.exports = util;
