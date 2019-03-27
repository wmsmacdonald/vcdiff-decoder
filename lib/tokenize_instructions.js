'use strict';

const instructions = require('./instructions');
const deserializeInteger = require('./deserialize/integer');

function tokenizeInstructions(instructionsBuffer) {
  let deserializedInstructions = [];

  let instructionsPosition = 0;

  while (instructionsPosition < instructionsBuffer.length) {
    let index = instructionsBuffer[instructionsPosition++];

    let addSize, copySize, size;

    if (index === 0) {
      ({ value: size, position: instructionsPosition } = deserializeInteger(instructionsBuffer, instructionsPosition));
      deserializedInstructions.push(new instructions.RUN(size));
    }
    else if (index === 1) {
      ({ value: size, position: instructionsPosition } = deserializeInteger(instructionsBuffer, instructionsPosition));
      deserializedInstructions.push(new instructions.ADD(size));
    }
    else if (index < 19) {
      deserializedInstructions.push(new instructions.ADD(index - 1));
    }
    else if (index === 19) {
      ({ value: size, position: instructionsPosition } = deserializeInteger(instructionsBuffer, instructionsPosition));
      deserializedInstructions.push(new instructions.COPY(size, 0));
    }
    else if (index < 35) {
      deserializedInstructions.push(new instructions.COPY(index - 16, 0));
    }
    else if (index === 35) {
      ({ value: size, position: instructionsPosition } = deserializeInteger(instructionsBuffer, instructionsPosition));
      deserializedInstructions.push(new instructions.COPY(size, 1));
    }
    else if (index < 51) {
      deserializedInstructions.push(new instructions.COPY(index - 32, 1));
    }
    else if (index === 51) {
      ({ value: size, position: instructionsPosition } = deserializeInteger(instructionsBuffer, instructionsPosition));
      deserializedInstructions.push(new instructions.COPY(size, 2));
    }
    else if (index < 67) {
      deserializedInstructions.push(new instructions.COPY(index - 48, 2));
    }
    else if (index === 67) {
      ({ value: size, position: instructionsPosition } = deserializeInteger(instructionsBuffer, instructionsPosition));
      deserializedInstructions.push(new instructions.COPY(size, 3));
    }
    else if (index < 83) {
      deserializedInstructions.push(new instructions.COPY(index - 64, 3));
    }
    else if (index === 83) {
      ({ value: size, position: instructionsPosition } = deserializeInteger(instructionsBuffer, instructionsPosition));
      deserializedInstructions.push(new instructions.COPY(size, 4));
    }
    else if (index < 99) {
      deserializedInstructions.push(new instructions.COPY(index - 80, 4));
    }
    else if (index === 99) {
      ({ value: size, position: instructionsPosition } = deserializeInteger(instructionsBuffer, instructionsPosition));
      deserializedInstructions.push(new instructions.COPY(size, 5));
    }
    else if (index < 115) {
      deserializedInstructions.push(new instructions.COPY(index - 96, 5));
    }
    else if (index === 115) {
      ({ value: size, position: instructionsPosition } = deserializeInteger(instructionsBuffer, instructionsPosition));
      deserializedInstructions.push(new instructions.COPY(size, 6));
    }
    else if (index < 131) {
      deserializedInstructions.push(new instructions.COPY(index - 112, 6));
    }
    else if (index === 131) {
      ({ value: size, position: instructionsPosition } = deserializeInteger(instructionsBuffer, instructionsPosition));
      deserializedInstructions.push(new instructions.COPY(size, 7));
    }
    else if (index < 147) {
      deserializedInstructions.push(new instructions.COPY(index - 128, 7));
    }
    else if (index === 147) {
      ({ value: size, position: instructionsPosition } = deserializeInteger(instructionsBuffer, instructionsPosition));
      deserializedInstructions.push(new instructions.COPY(size, 8));
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
  }

  return deserializedInstructions;
}

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

  return {addSize, copySize};
}

module.exports = tokenizeInstructions;