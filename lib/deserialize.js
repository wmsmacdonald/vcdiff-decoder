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
  return {
    // for some reason ~1 mask has to be before...
    VCD_SOURCE: 1 & decimal,
    VCD_TARGET: 1 & (decimal >> 1)
  }
};

Deserialize.hdrIndicator = function(decimal) {
  return {
    // for some reason ~1 mask has to be before...
    VCD_DECOMPRESS: 1 & decimal,
    VCD_CODETABLE: 1 & (decimal >> 1)
  }
};

Deserialize.instruction = function(instructions, instructionsPosition, data, dataPosition) {
  let index = instructions[instructionsPosition++];
  let instruction;

  if (index === 0) {
    throw Error('zero');
  }
  else if (index < 19) {
    instruction =  new Add(data, dataPosition, index - 1);
  }
  return {
    instruction,
    instructionsPosition
  };

};

function Add(data, dataPosition, size) {
  this.execute = function(U, positionU) {
    data.copy(U, positionU, dataPosition, dataPosition + size);
    return dataPosition + size;
  }
}

module.exports = Deserialize;