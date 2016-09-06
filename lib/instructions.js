'use strict';

const deserializeInteger = require('./deserialize/integer');

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

  let address;
  // get next address and increase the address position for the next address
  ({value: address, position: delta.addressesPosition } = deserializeInteger(delta.addresses, delta.addressesPosition));
  for (let i = 0; i < this.size; i++) {
    delta.U.set(delta.UTargetPosition + i, delta.U[address + i]);
  }
  delta.UTargetPosition += this.size;
};

RUN.prototype.execute = function(delta) {
  for (let i = 0; i < this.size; i++) {
    // repeat single byte
    delta.U[delta.UTargetPosition + i] = delta.data[delta.dataPosition];
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