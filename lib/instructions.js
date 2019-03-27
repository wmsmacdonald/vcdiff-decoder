'use strict';

const deserializeInteger = require('./deserialize/integer');
const TypedArray = require('./typed_array_util');

function ADD(size) {
  this.size = size;
}
function COPY(size, mode) {
  this.size = size;
  this.mode = mode;
}
function RUN(size) {
  this.size = size;
}

ADD.prototype.name = 'ADD';
COPY.prototype.name = 'COPY';
RUN.prototype.name = 'RUN';

ADD.prototype.execute = function(delta) {
  for (let i = 0; i < this.size; i++) {
    delta.U.set(delta.UTargetPosition + i, delta.data[delta.dataPosition + i]);
  }
  delta.dataPosition += this.size;
  delta.UTargetPosition += this.size;
};

COPY.prototype.execute = function(delta) {
  let address, m, next, method;

  if (this.mode === 0) {
    address = delta.getNextAddressInteger();
  }
  else if (this.mode === 1) {
    next = delta.getNextAddressInteger();
    address = delta.UTargetPosition - next;
  }
  else if ((m = this.mode - 2) >= 0 && (m < delta.nearCache.size)) {
    next = delta.getNextAddressInteger();
    address = delta.nearCache.get(m, next);
    method = 'near';
  }
  // same cache
  else {
    m = this.mode - (2 + delta.nearCache.size);
    next = delta.getNextAddressByte();
    address = delta.sameCache.get(m, next);
    method = 'same';
  }

  delta.nearCache.update(address);
  delta.sameCache.update(address);

  for (let i = 0; i < this.size; i++) {
    delta.U.set(delta.UTargetPosition + i, delta.U.get(address + i));
  }

  delta.UTargetPosition += this.size;
};

RUN.prototype.execute = function(delta) {
  for (let i = 0; i < this.size; i++) {
    // repeat single byte
    delta.U.set(delta.UTargetPosition + i, delta.data[delta.dataPosition]);
  }
  // increment to next byte
  delta.dataPosition++;
  delta.UTargetPosition += this.size;
};

let instructions = {
  ADD,
  COPY,
  RUN
};

module.exports = instructions;