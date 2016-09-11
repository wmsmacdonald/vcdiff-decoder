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

function equal(typedArray1, typedArray2) {
  if (typedArray1.length !== typedArray2.length) {
    return false;
  }
  for (let i = 0; i < typedArray1.length; i++) {
    if (typedArray1[i] !== typedArray2[i]) {
      return false;
    }
  }
  return true;
}

function TypedArrayList() {
  this.typedArrays = [];
  this.startIndexes = [];
  this.length = 0;
}

TypedArrayList.prototype.add = function(typedArray) {
  let typedArrayTypes = [Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array,
    Int32Array, Uint32Array, Float32Array, Float64Array];

  let matchingTypedArrayTypes = typedArrayTypes.filter(typedArrayType => typedArray instanceof typedArrayType);
  if (matchingTypedArrayTypes.length < 1) {
    throw Error('Given ' + typeof typedArray + ' when expected a TypedArray');
  }

  let startIndex;
  if (this.typedArrays.length === 0) {
    startIndex = 0;
  }
  else {
    let lastIndex = this.startIndexes.length - 1;
    let lastStartIndex = this.startIndexes[lastIndex];
    let lastLength = this.typedArrays[lastIndex].length;
    startIndex = lastStartIndex + lastLength;
  }

  this.startIndexes.push(startIndex);
  this.typedArrays.push(typedArray);
  this.length += startIndex + typedArray.length;
};

TypedArrayList.prototype.get = function(index) {
  let listIndex = getIndex(this.startIndexes, index);
  let typedArray = index - this.startIndexes[listIndex];
  return this.typedArrays[listIndex][typedArray];
};

TypedArrayList.prototype.set = function(index, value) {
  if (typeof index !== 'number' || isNaN(index)) {
    throw new Error('Given non-number index: ' + index);
  }
  //console.log(index);

  let listIndex = getIndex(this.startIndexes, index);
  let typedArrayIndex = index - this.startIndexes[listIndex];
  this.typedArrays[listIndex][typedArrayIndex] = value;
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
  equal,
  TypedArrayList
};

