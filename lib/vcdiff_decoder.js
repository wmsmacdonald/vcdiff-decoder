'use strict';
const errors = require('./errors');
const VCDiff = require('./vcdiff');

/**
 *
 * @param delta {Uint8Array}
 * @param source {Uint8Array}
 */
function decodeSync(delta, source) {
  let vcdiff = new VCDiff(delta, source);
  return vcdiff.decode();
}

function decode(delta, buffer) {

}

module.exports = {
  decodeSync,
  decode
};


