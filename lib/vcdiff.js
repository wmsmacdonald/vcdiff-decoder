'use strict';

const errors = require('./errors');
const Deserialize = require('./deserialize');
const TypedArray = require('./typed_array_util');

/**
 *
 * @param delta {Uint8Array}
 * @param source {Uint8Array}
 * @constructor
 */
function VCDiff(delta, source) {
  this.delta = delta;
  this.position = 0;
  this.source = source;
  this.targetWindows = new TypedArray.Uint8ArrayList();
}

VCDiff.prototype.decode = function() {
  this._consumeHeader();
  this._consumeWindow();

  let targetLength = this.targetWindows.uint8Arrays.reduce((sum, uint8Array) => uint8Array.length + sum, 0);
  let target = new Uint8Array(targetLength);
  let position = 0;
  for (let arrayNum = 0; arrayNum < this.targetWindows.uint8Arrays.length; arrayNum++) {
    let array = this.targetWindows.uint8Arrays[arrayNum];
    let length = array.length;
    target.set(array, position);
    position += length;
  }
  return target;
};

VCDiff.prototype._consumeHeader = function() {

  let hasVCDiffHeader = this.delta[0] === 56 && // V
      this.delta[1] === 43 && // C
      this.delta[2] === 44 && // D
      this.delta[3] === 0; // \0

  if (hasVCDiffHeader) {
    throw new errors.InvalidDelta('first 3 bytes not VCD');
  }

  let hdrIndicator = this.delta[4];
  // extract least significant bit
  let vcdDecompress = 1 & hdrIndicator;
  // extract second least significant bit
  let vcdCodetable = 1 & (hdrIndicator >> 1);

  // verify not using Hdr_Indicator
  if (vcdDecompress || vcdCodetable) {
    throw new errors.NotImplemented(
      'non-zero Hdr_Indicator (VCD_DECOMPRESS or VCD_CODETABLE bit is set)'
    );
  }

  this.position += 5;
};

VCDiff.prototype._consumeWindow = function() {
  let winIndicator = this.delta[this.position++];

  // extract least significant bit
  let vcdSource = 1 & winIndicator;
  // extract second least significant bit
  let vcdTarget = 1 & (winIndicator >> 1);

  if (vcdSource && vcdTarget) {
    throw new errors.InvalidDelta(
      'VCD_SOURCE and VCD_TARGET cannot both be set in Win_Indicator'
    )
  }
  else if (vcdSource) {

    this.position += 2;
  }
  else if (vcdTarget) {
    throw new errors.NotImplemented(
      'non-zero VCD_TARGET in Win_Indicator'
    )
  }

  let deltaLength;
  // get deltaLength and update position at the same time
  ({ value: deltaLength, position: this.position } = Deserialize.integer(this.delta, this.position));
  this._buildTargetWindow(this.position);
  this.position += deltaLength;
};

VCDiff.prototype._buildTargetWindow = function(position) {
  let window = Deserialize.delta(this.delta, position);
  this.position = window.position;

  let U = new Uint8Array(this.source.length + window.targetWindowLength);

  this.source.copyWithin(U, 0);

  let targetPosition = this.source.length;
  let dataPosition = 0;

  let instructionPosition = 0, instruction;
  while (instructionPosition < window.instructions.length) {
    ({ nextPosition: instructionPosition, instruction } = Deserialize.instruction(window.instructions, instructionPosition, window.data, dataPosition));
    dataPosition = instruction.execute(U, targetPosition, window.data);
  }

  let target = U.slice(this.source.length);
  this.targetWindows.add(target);
};

module.exports = VCDiff;