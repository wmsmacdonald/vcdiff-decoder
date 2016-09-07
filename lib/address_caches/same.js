'use strict';

function SameCache(size) {
  this.size = size;
  this.same = new Array(this.size * 256).fill(0);
}

SameCache.prototype.update = function(address) {
  if (this.same.length > 0) {
    this.same[address % (this.same.length * 256)] = address;
  }
};

SameCache.prototype.get = function(m, offset) {
  let address = this.same[m * 256 + offset];
  return address;
};

module.exports = SameCache;