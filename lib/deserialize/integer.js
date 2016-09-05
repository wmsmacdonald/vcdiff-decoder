'use strict';

/**
 * Converts RFC 3284 definition of integer in buffer to decimal
 * Also returns the index of the byte after the integer
 * @param buffer {Uint8Array}
 * @param position {Number}
 * @returns {{position: {Number}, value: {Number}}}
 */
function integer(buffer, position) {
  let integer = buffer[position++];
  let digitArray = [];

  // if the most significant bit is set, the the integer continues
  while (integer >= 128 ) {
    digitArray.unshift(integer - 128);
    integer = buffer[position++];
  }

  digitArray.unshift(integer);

  // convert from base 128 to decimal
  return {
    position: position,
    value: digitArray.reduce((sum, digit, index) => sum + digit * Math.pow(128, index), 0)
  };
}

module.exports = integer;