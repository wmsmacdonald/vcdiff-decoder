'use strict';

/**
 * Converts RFC 3284 definition of integer in buffer to decimal
 * Also returns the index of the byte after the integer
 * @param buffer {Uint8Array}
 * @param position {Number}
 * @returns {{position: {Number}, value: {Number}}}
 */
function integer(buffer, position) {
  const result = { position, value: 0 };

  do {
    /* Shift the existing value left for 7 bits (base127 conversion)
       and merge it with the next value without its highest bit */
    result.value = (result.value << 7) | (buffer[result.position] & 127);

    /* Avoid Number overflows */
    if (result.value < 0) {
      throw new Error('RFC 3284 Integer conversion: Buffer overflow');
    }
  } while (buffer[result.position++] & 128);

  return result;
}

module.exports = integer;
