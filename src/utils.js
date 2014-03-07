exports.toArray = function(arrayLike) {
  'use strict';
  var arr = [], i = arrayLike.length;
  while ( i-- ) {
    arr[i] = arrayLike[i];
  }
  return arr;
};
