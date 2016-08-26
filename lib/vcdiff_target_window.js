'use strict';

const Deserialize = require('./deserialize');
const errors = require('./errors');

function FromSource(delta, position, source, sourceLength, sourcePosition) {
  this.delta = delta;
  this.position = position;
  this.source = source;
  this.sourceLength = sourceLength;
  this.sourcePosition = sourcePosition;
}

function FromTarget(delta, position, target) {
  this.delta = delta;
  this.position = position;
  this.target = target;
}

FromSource.prototype.parse = function() {
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
  //console.log(deltaLength, targetWindowLength, dataLength, instructionsLength, addressesLength);

  let dataNextPosition = nextPosition + dataLength;
  let data = this.delta.slice(nextPosition, dataNextPosition);

  let instructionsNextPosition = dataNextPosition + instructionsLength;
  let instructions = this.delta.slice(dataNextPosition, instructionsNextPosition);

  let addressesNextPosition = instructionsNextPosition + addressesLength;
  let addresses = this.delta.slice(instructionsNextPosition, addressesNextPosition);

  return {
    nextPosition: addressesNextPosition,
    data,
    instructions,
    addresses
  }
};


FromTarget.prototype.decode = function() {

};

module.exports = {
  FromSource,
  FromTarget
};