'use strict';

const errors = require('./errors');
const instructions = require('./instructions');

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
  let deserializedInstructions = Deserialize.instructions(instructions);

  let addressesNextPosition = instructionsNextPosition + addressesLength;
  let addresses = delta.slice(instructionsNextPosition, addressesNextPosition);

  position = addressesNextPosition;

  let window = {
    targetWindowLength,
    position,
    data,
    instructions: deserializedInstructions,
    addresses
  };

  return window;
};

Deserialize.instructions = function(instructionsBuffer) {
  let deserializedInstructions = [];

  instructionsBuffer.forEach(index => {

    let addSize, copySize;

    if (index === 0) {
      deserializedInstructions.push(new instructions.RUN());
    }
    else if (index < 19) {
      deserializedInstructions.push(new instructions.ADD(index - 1));
    }
    else if (index === 19) {
      deserializedInstructions.push(new instructions.COPY(0, 0));
    }
    else if (index < 35) {
      deserializedInstructions.push(new instructions.COPY(index - 16, 0));
    }
    else if (index === 35) {
      deserializedInstructions.push(new instructions.COPY(0, 1));
    }
    else if (index < 51) {
      deserializedInstructions.push(new instructions.COPY(index - 32, 1));
    }
    else if (index === 51) {
      deserializedInstructions.push(new instructions.COPY(0, 2));
    }
    else if (index < 67) {
      deserializedInstructions.push(new instructions.COPY(index - 48, 2));
    }
    else if (index === 67) {
      deserializedInstructions.push(new instructions.COPY(0, 3));
    }
    else if (index < 83) {
      deserializedInstructions.push(new instructions.COPY(index - 64, 3));
    }
    else if (index === 83) {
      deserializedInstructions.push(new instructions.COPY(0, 4));
    }
    else if (index < 99) {
      deserializedInstructions.push(new instructions.COPY(index - 80, 4));
    }
    else if (index === 99) {
      deserializedInstructions.push(new instructions.COPY(0, 5));
    }
    else if (index < 115) {
      deserializedInstructions.push(new instructions.COPY(index - 96, 5));
    }
    else if (index === 115) {
      deserializedInstructions.push(new instructions.COPY(0, 6));
    }
    else if (index < 131) {
      deserializedInstructions.push(new instructions.COPY(index - 112, 6));
    }
    else if (index === 131) {
      deserializedInstructions.push(new instructions.COPY(0, 7));
    }
    else if (index < 146) {
      deserializedInstructions.push(new instructions.COPY(index - 127, 7));
    }
    else if (index === 146) {
      deserializedInstructions.push(new instructions.COPY(0, 8));
    }
    else if (index < 163) {
      deserializedInstructions.push(new instructions.COPY(index - 144, 8));
    }
    else if (index < 175) {
      ({addSize, copySize} = ADD_COPY(index, 163));

      deserializedInstructions.push(new instructions.ADD(addSize));
      deserializedInstructions.push(new instructions.COPY(copySize, 0));
    }
    else if (index < 187) {
      ({addSize, copySize} = ADD_COPY(index, 175));

      deserializedInstructions.push(new instructions.ADD(addSize));
      deserializedInstructions.push(new instructions.COPY(copySize, 1));
    }
    else if (index < 199) {
      ({addSize, copySize} = ADD_COPY(index, 187));

      deserializedInstructions.push(new instructions.ADD(addSize));
      deserializedInstructions.push(new instructions.COPY(copySize, 2));
    }
    else if (index < 211) {
      ({addSize, copySize} = ADD_COPY(index, 199));

      deserializedInstructions.push(new instructions.ADD(addSize));
      deserializedInstructions.push(new instructions.COPY(copySize, 3));
    }
    else if (index < 223) {
      ({addSize, copySize} = ADD_COPY(index, 211));

      deserializedInstructions.push(new instructions.ADD(addSize));
      deserializedInstructions.push(new instructions.COPY(copySize, 4));
    }
    else if (index < 235) {
      ({addSize, copySize} = ADD_COPY(index, 223));

      deserializedInstructions.push(new instructions.ADD(addSize));
      deserializedInstructions.push(new instructions.COPY(copySize, 5));
    }
    else if (index < 239) {
      deserializedInstructions.push(new instructions.ADD(index - 235 + 1));
      deserializedInstructions.push(new instructions.COPY(4, 6));
    }
    else if (index < 243) {
      deserializedInstructions.push(new instructions.ADD(index - 239 + 1));
      deserializedInstructions.push(new instructions.COPY(4, 7));
    }
    else if (index < 247) {
      deserializedInstructions.push(new instructions.ADD(index - 243 + 1));
      deserializedInstructions.push(new instructions.COPY(4, 8));
    }
    else if (index < 256) {
      deserializedInstructions.push(new instructions.COPY(4, index - 247));
      deserializedInstructions.push(new instructions.ADD(1));
    }
    else {
      throw new Error('Should not get here');
    }
  });

  return deserializedInstructions;
};

function ADD_COPY(index, baseIndex) {
  let zeroBased = index - baseIndex;

  // 0,1,2 -> 0   3,4,5 -> 1   etc.
  let addSizeIndex = Math.floor(zeroBased / 3);
  // offset so size starts at 1
  let addSize = addSizeIndex + 1;

  // rotate through 0, 1, and 2
  let copySizeIndex = zeroBased % 3;
  // offset so size starts at 4
  let copySize = copySizeIndex + 4;
 
  return [addSize, copySize];
}

module.exports = Deserialize;