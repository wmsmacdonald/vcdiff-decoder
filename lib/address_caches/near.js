'use strict';

function NearCache(size) {
  this.size = size;
  this.near = new Array(this.size).fill(0);
  this.nextSlot = 0;
}

NearCache.prototype.update = function(address) {
  if (this.near.length > 0) {
    this.near[this.nextSlot] = address;
    this.nextSlot = (this.nextSlot + 1) % this.near.length;
  }
};

NearCache.prototype.get = function(m, offset) {
  let address = this.near[m] + offset;
  return address;
};

module.exports = NearCache;