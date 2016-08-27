'use strict';

const errors = require('./errors');
const Deserialize = require('./deserialize');

function VCDiff(delta, source) {
  this.delta = delta;
  this.position = 0;
  this.source = source;
}

VCDiff.prototype.decode = function() {
  this._consumeHeader();
  this._consumeWindow();
  let target = this._decodeWindow();
  return target;
};

VCDiff.prototype._consumeHeader = function() {

  let fileType = this.delta.slice(0, 4).toString('ascii');
  if (fileType !== 'VCD\0') {
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
};

VCDiff.prototype._decodeWindow = function() {
  let window = Deserialize.window(this.delta, this.position);
  this.position = window.position;
  let U = new Buffer.alloc(this.source.length + window.targetWindowLength);

  this.source.copy(U, 0, 0);

  let targetPosition = this.source.length;
  let dataPosition = 0;

  let instructionPosition = 0, instruction;
  while (instructionPosition < window.instructions.length) {
    ({ nextPosition: instructionPosition, instruction } = Deserialize.instruction(window.instructions, instructionPosition, window.data, dataPosition));
    dataPosition = instruction.execute(U, targetPosition, window.data);
  }

  let target = U.slice(this.source.length);

  return target;
};

module.exports = VCDiff;