'use strict';

function uint8ArrayToString(uintArray) {
  let encodedString = String.fromCharCode.apply(null, uintArray);
  let decodedString = decodeURIComponent(escape(encodedString));
  return decodedString;
}

function stringToUint8Array(str) {
  var buf = new Uint8Array(str.length);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    buf[i] = str.charCodeAt(i);
  }
  return buf;
}

function Uint8ArrayList() {
  this.uint8Arrays = [];
  this.startIndexes = [];
}

Uint8ArrayList.prototype.add = function(uint8Array) {
  let startIndex;
  if (this.uint8Arrays.length === 0) {
    startIndex = 0;
  }
  else {
    let lastIndex = this.startIndexes.length - 1;
    let lastStartIndex = this.startIndexes[lastIndex];
    let lastLength = this.uint8Arrays[lastIndex].length;
    startIndex = lastStartIndex + lastLength;
  }

  this.startIndexes.push(startIndex);
  this.uint8Arrays.push(uint8Array);
};

Uint8ArrayList.prototype.get = function(index) {
  let listIndex = getIndex(this.startIndexes, index);
  let indexInUint8Array = index - this.startIndexes[listIndex];
  return this.uint8Arrays[listIndex][indexInUint8Array];
};

function getIndex(arr, element) {
  let low = 0;
  let high = arr.length - 1;

  while (low < high) {
    let mid = Math.floor((low + high) / 2);

    if (arr[mid] === element) {
      return mid;
    }
    else if (arr[mid] < element) {
      low = mid + 1;
    }
    else {
      high = mid - 1;
    }
  }
  if (arr[high] > element) {
    return high - 1;
  }
  else {
    return high;
  }
}

module.exports = {
  uint8ArrayToString,
  stringToUint8Array,
  Uint8ArrayList
};