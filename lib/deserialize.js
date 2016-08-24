'use strict';

let Deserialize = {};

Deserialize.decimalToBinary = function(decimal) {
  return decimal.toString(2).split('');
};

Deserialize.integer = function(decimal) {

};


Deserialize.winIndicator = function(decimal) {
  let bitArray = Deserialize.decimalToBinary(decimal);

  return {
    VCD_SOURCE: bitString[bitString.length - 1],
    VCD_TARGET: bitString[bitString.length - 2]
  }
};