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
  this.targetWindows = new TypedArray.TypedArrayList();
}

VCDiff.prototype.decode = function() {
  this._consumeHeader();
  this._consumeWindow();

  let targetLength = this.targetWindows.typedArrays.reduce((sum, uint8Array) => uint8Array.length + sum, 0);
  let target = new Uint8Array(targetLength);
  let position = 0;

  // concat all uint8arrays
  for (let arrayNum = 0; arrayNum < this.targetWindows.typedArrays.length; arrayNum++) {
    let array = this.targetWindows.typedArrays[arrayNum];
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
    let sourceSegmentLength, sourceSegmentPosition, deltaLength;
    ({ value: sourceSegmentLength, position: this.position } = Deserialize.integer(this.delta, this.position++));
    ({ value: sourceSegmentPosition, position: this.position } = Deserialize.integer(this.delta, this.position++));
    ({ value: deltaLength, position: this.position } = Deserialize.integer(this.delta, this.position));

    let sourceSegment = this.source.slice(sourceSegmentPosition, sourceSegmentPosition + sourceSegmentLength);
    this._buildTargetWindow(this.position, sourceSegment);
    this.position += deltaLength;
  }
  else if (vcdTarget) {
    throw new errors.NotImplemented(
      'non-zero VCD_TARGET in Win_Indicator'
    )
  }

};

VCDiff.prototype._buildTargetWindow = function(position, sourceSegment) {
  let window = Deserialize.delta(this.delta, position);

  let T = new Uint8Array(window.targetWindowLength);

  let U = new TypedArray.TypedArrayList();
  U.add(sourceSegment);
  U.add(T);

  let targetPosition = this.source.length;
  let dataPosition = 0;

  let delta = new Delta(U, this.source.length, window.data, window.addresses);

  window.instructions.forEach(instruction => {
    instruction.execute(delta);
  });

  let target = U.typedArrays[1];
  this.targetWindows.add(target);
};

function Delta(U, UTargetPosition, data, addresses) {
  this.U = U;
  this.UTargetPosition = UTargetPosition;
  this.data = data;
  this.dataPosition = 0;
  this.addresses = addresses;
  this.addressesPosition = 0;
}

module.exports = VCDiff;