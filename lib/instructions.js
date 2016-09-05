'use strict';

let instructions = {};

instructions.ADD = function ADD(size) {
  this.size = size;
  this.execute = function(delta) {
    for (let i = 0; i < this.size; i++) {
      delta.U.set([delta.UTargetPosition + i], delta.data[delta.dataPosition + i]);
    }
    this.dataPosition += size;
    this.UTargetPosition += size;
  }
};

instructions.COPY = function COPY(size, mode) {
  this.size = size;
  this.mode = mode;
  this.execute = function(delta) {
    let address;
    // get next address and increase the address position for the next address
    ({value: address, position: delta.addressesPosition } = Deserialize.integer(delta.addresses, this.addressesPosition));
    for (let i = 0; i < this.size; i++) {
      delta.U[delta.UTargetPosition + i] = delta.U[address + i];
    }
    this.UTargetPosition += size;
  }
};

instructions.RUN = function RUN(size) {
  this.size = size;
  this.execute = function(delta) {
    for (let i = 0; i < this.size; i++) {
      // repeat single byte
      delta.U[delta.UTargetPosition + i] = delta.data[delta.dataPosition];
    }
    // increment to next byte
    delta.dataPosition++;
  }
};

module.exports = instructions;