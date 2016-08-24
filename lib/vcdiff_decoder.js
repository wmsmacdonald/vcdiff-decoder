'use strict';
const errors = require('./errors');

/**
 *
 * @param delta {Buffer}
 * @param source {Buffer}
 */
function decodeSync(delta, source) {
  let pos = consumeHeader(delta);
}

function consumeHeader(delta) {
  let fileType = delta.splice(0, 4).toString('ascii');
  if (fileType === 'VCD\0') {
    throw new errors.InvalidDelta('first 3 bytes not VCD');
  }


}

function decode(delta, buffer) {

}

module.exports = {
  decodeSync,
  decode
};


