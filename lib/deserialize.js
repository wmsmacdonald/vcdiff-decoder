'use strict';

const errors = require('./errors');

let Deserialize = {};

Deserialize.decimalToBinary = function(decimal) {
  return decimal.toString(2).split('');
};

/**
 * Converts RFC 3284 definition of integer in buffer to decimal
 * Also returns the index of the byte after the integer
 * @param buffer {Uint8Array}
 * @param position {Number}
 * @returns {{position: {Number}, value: {Number}}}
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
    position: position,
    value: digitArray.reduce((sum, digit, index) => sum + digit * Math.pow(128, index), 0)
  };
};

Deserialize.delta = function(delta, position) {

  let targetWindowLength, dataLength, instructionsLength, addressesLength;

  // parentheses are needed for assignment destructuring
  ({ value: targetWindowLength, position } = Deserialize.integer(delta, position));

  // Delta_Indicator byte
  if (delta[position] !== 0) {
    throw new errors.NotImplemented('VCD_DECOMPRESS is not supported, therefore Delta_Indicator must be zero');
  }
  position++;

  ({ value: dataLength, position } = Deserialize.integer(delta, position));
  ({ value: instructionsLength, position } = Deserialize.integer(delta, position));
  ({ value: addressesLength, position } = Deserialize.integer(delta, position));

  let dataNextPosition = position + dataLength;
  let data = delta.slice(position, dataNextPosition);

  let instructionsNextPosition = dataNextPosition + instructionsLength;
  let instructions = delta.slice(dataNextPosition, instructionsNextPosition);

  let addressesNextPosition = instructionsNextPosition + addressesLength;
  let addresses = delta.slice(instructionsNextPosition, addressesNextPosition);

  position = addressesNextPosition;

  let window = {
    targetWindowLength,
    position,
    data,
    instructions,
    addresses
  };

  return window;
};

Deserialize.instruction = function(instructions, instructionsPosition, data, dataPosition) {
  let index = instructions[instructionsPosition++];
  let instruction;

  if (index === 0) {
    throw new Error('zero');
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
    let targetData = data.slice(dataPosition, dataPosition + size);
    U.typedArrays[1].set(targetData);
    return dataPosition + size;
  }
}

module.exports = Deserialize;