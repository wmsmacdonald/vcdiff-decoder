'use strict';

let Deserialize = {};

Deserialize.decimalToBinary = function(decimal) {
  return decimal.toString(2).split('');
};

/**
 *
 * @param buffer {Buffer}
 * @param position {Number}
 * @returns {{nextPosition: {Number}, value: {Number}}}
 */
Deserialize.integer = function(buffer, position) {
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
    nextPosition: position,
    value: digitArray.reduce((sum, digit, index) => sum + digit * Math.pow(128, index), 0)
  };
};


Deserialize.winIndicator = function(decimal) {
  let bitArray = Deserialize.decimalToBinary(decimal);

  return {
    VCD_SOURCE: bitString[bitString.length - 1],
    VCD_TARGET: bitString[bitString.length - 2]
  }
};

module.exports = Deserialize;