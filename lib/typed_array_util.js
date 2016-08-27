'use strict';

function Uint8ArrayToString(uintArray) {
  var encodedString = String.fromCharCode.apply(null, uintArray),
    decodedString = decodeURIComponent(escape(encodedString));
  return decodedString;
}

function stringToUint8Array(str) {
  var buf = new Uint8Array(str.length*1); // 2 bytes for each char
  for (var i=0, strLen=str.length; i < strLen; i++) {
    buf[i] = str.charCodeAt(i);
  }
  return buf;
}

module.exports = {
  Uint8ArrayToString,
  stringToUint8Array
};