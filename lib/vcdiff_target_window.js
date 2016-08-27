'use strict';

const Deserialize = require('./deserialize');
const errors = require('./errors');

function FromTarget(delta, position, target) {
  this.delta = delta;
  this.position = position;
  this.target = target;
}

function FromSource(delta, position, source, sourceLength, sourcePosition) {
  this.delta = delta;
  this.position = position;
  this.source = source;
  this.sourceLength = sourceLength;
  this.sourcePosition = sourcePosition;
}

FromSource.prototype._parse = function() {
  let nextPosition, deltaLength, targetWindowLength, dataLength, instructionsLength, addressesLength;

  // parentheses are needed for assignment destructuring
  ({ value: deltaLength, nextPosition } = Deserialize.integer(this.delta, this.position));
  ({ value: targetWindowLength, nextPosition } = Deserialize.integer(this.delta, nextPosition));

  // Delta_Indicator byte
  if (this.delta[nextPosition] !== 0) {
    throw (errors.NotImplemented('VCD_DECOMPRESS is not supported, therefore Delta_Indicator must be zero'));
  }
  nextPosition++;

  ({ value: dataLength, nextPosition } = Deserialize.integer(this.delta, nextPosition));
  ({ value: instructionsLength, nextPosition } = Deserialize.integer(this.delta, nextPosition));
  ({ value: addressesLength, nextPosition } = Deserialize.integer(this.delta, nextPosition));

  let dataNextPosition = nextPosition + dataLength;
  let data = this.delta.slice(nextPosition, dataNextPosition);

  let instructionsNextPosition = dataNextPosition + instructionsLength;
  let instructions = this.delta.slice(dataNextPosition, instructionsNextPosition);

  let addressesNextPosition = instructionsNextPosition + addressesLength;
  let addresses = this.delta.slice(instructionsNextPosition, addressesNextPosition);

  this.position = addressesNextPosition;

  return {
    targetWindowLength,
    data,
    instructions,
    addresses
  }
};

FromSource.prototype.decode = function() {
  let info = this._parse();
  let U = new Buffer.alloc(this.source.length + info.targetWindowLength);

  this.source.copy(U, 0, 0);

  let targetPosition = this.source.length;
  let dataPosition = 0;

  let instructionPosition = 0, instruction;
  while (instructionPosition < info.instructions.length) {
    ({ nextPosition: instructionPosition, instruction } = Deserialize.instruction(info.instructions, instructionPosition, info.data, dataPosition));
    dataPosition = instruction.execute(U, targetPosition, info.data);
  }

  let target = U.slice(this.source.length);

  return {
    target,
    position: this.position
  }
};

let VCDiffTargetWindow = {
  FromSource
};

module.exports = VCDiffTargetWindow;