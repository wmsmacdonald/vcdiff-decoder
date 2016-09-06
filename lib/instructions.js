'use strict';

const deserializeInteger = require('./deserialize/integer');

function Instruction(size) {
  this.size = size;
}

function ADD(size) {
  this.size = size;
}
function COPY(size, mode) {
  this.size = size;
  this.mode = mode;
}
function RUN() {}

ADD.prototype.name = 'ADD';
COPY.prototype.name = 'COPY';
RUN.prototype.name = 'RUN';

// link instruction prototypes to Instruction
ADD.prototype = Object.create(Instruction.prototype);
ADD.prototype.constructor = ADD;
COPY.prototype = Object.create(Instruction.prototype);
COPY.prototype.constructor = COPY;
RUN.prototype = Object.create(Instruction.prototype);
RUN.prototype.constructor = RUN;

ADD.prototype.execute = function(delta) {
  for (let i = 0; i < this.size; i++) {
    delta.U.set([delta.UTargetPosition + i], delta.data[delta.dataPosition + i]);
  }
  this.dataPosition += this.size;
  this.UTargetPosition += this.size;
};

COPY.prototype.execute = function(delta) {
  let address;
  // get next address and increase the address position for the next address
  ({value: address, position: delta.addressesPosition } = deserializeInteger(delta.addresses, delta.addressesPosition));
  for (let i = 0; i < this.size; i++) {
    delta.U[delta.UTargetPosition + i] = delta.U[address + i];
  }
  this.UTargetPosition += this.size;
};

RUN.prototype.execute = function(delta) {
  for (let i = 0; i < this.size; i++) {
    // repeat single byte
    delta.U[delta.UTargetPosition + i] = delta.data[delta.dataPosition];
  }
  // increment to next byte
  delta.dataPosition++;
};

let instructions = {
  ADD,
  COPY,
  RUN
};

module.exports = instructions;