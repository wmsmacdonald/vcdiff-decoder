'use strict';

const errors = require('./errors');
const Deserialize = require('./deserialize');

function VCDiff(delta, source, target) {
  this.delta = delta;
  this.position = 0;
  this.source = source;
  this.target = target;
}

VCDiff.prototype.decode = function() {

};

VCDiff.prototype._consumeWindow = function() {
  let winIndicator = Deserialize.winIndicator(this.delta[this.position++]);

  if (winIndicator.VCD_SOURCE === 1 && winIndicator.VCD_TARGET === 1) {
    throw new errors.InvalidDelta(
      'VCD_SOURCE and VCD_TARGET cannot both be set in Win_Indicator'
    )
  }
  // TODO not sure what this means for the algorithm
  else if (winIndicator.VCD_SOURCE === 1) {

  }
  else if (winIndicator.VCD_TARGET === 1) {
    throw new errors.NotImplemented(
      'non-zero VCD_TARGET in Win_Indicator'
    )
  }

};

VCDiff.prototype._consumeSourceInfo = function() {

};

VCDiff.prototype._consumeHeader = function() {

  let fileType = this.delta.slice(0, 4).toString('ascii');
  if (fileType !== 'VCD\0') {
    throw new errors.InvalidDelta('first 3 bytes not VCD');
  }

  let HdrIndicator = this.delta[4];
  // verify not using Hdr_Indicator
  if (HdrIndicator >= 1 && HdrIndicator <= 3) {
    throw new errors.NotImplemented(
      'non-zero Hdr_Indicator (VCD_DECOMPRESS or VCD_CODETABLE bit is set)'
    );
  }

  this.position += 5;
};





module.exports = VCDiff;