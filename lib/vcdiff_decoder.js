'use strict';

const VCDiff = require('./vcdiff');

/**
 * Vcdiff decode, applying delta to source and returning the result.
 * 
 * @param delta {Uint8Array} The Vcdiff format diff/patch to apply to source.
 * @param source {Uint8Array} The source to apply the delta diff/patch to.
 * @returns {Uint8Array} The result of applying delta to source.
 */
function decode(delta, source) {
  let vcdiff = new VCDiff(delta, source);
  return vcdiff.decode();
}

module.exports = {
  decode
};
