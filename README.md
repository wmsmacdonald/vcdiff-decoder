# Vcdiff Decoder

[![Build Status](https://travis-ci.org/ably-forks/vcdiff-decoder.svg?branch=master)](https://travis-ci.org/ably-forks/vcdiff-decoder)
[![npm version](https://badge.fury.io/js/%40ably%2Fvcdiff-decoder.svg)](https://badge.fury.io/js/%40ably%2Fvcdiff-decoder)

A Vcdiff decoder written in pure JavaScript.
Supports the Vcdiff format, as specified in [RFC 3284](https://tools.ietf.org/html/rfc3284).

Tested and proven with Vcdiff patch/delta files generated from
[Google](https://github.com/google)'s [open-vcdiff](https://github.com/google/open-vcdiff)
and [Joshua MacDonald](https://github.com/jmacd)'s [xdelta](https://github.com/jmacd/xdelta).

## Usage

```javascript
const vcdiff = require('@ably/vcdiff-decoder');

let target = vcdiff.decodeSync(deltaBuffer, new Buffer('some dictionary string buffer'));
console.log(target.toString());
```

## Exported Functions

### `decodeSync(delta, source)`

Synchronous decode. Parameters:

* `delta`: [`Buffer`](https://nodejs.org/api/buffer.html) - the binary Vcdiff format encoding of the patch/diff information needed to transform `source` to the returned target
* `source`: [`Buffer`](https://nodejs.org/api/buffer.html) - the group of bytes to transform to the returned target using by applying `delta`

Returns a `Buffer`, the 'target', being the result of applying `delta` to `source`.

### `decode(delta, source)`

Asynchronous decode.

The input parameters for this function are the same as for the synchronous function `decodeSync(delta, source)`.
The difference is that this function returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that either resolves with the target [`Buffer`](https://nodejs.org/api/buffer.html) or rejects with an error.

## Contributing

### Testing

To run all tests use

    npm test

Browser testing supported by

[<img src="./resources/Browserstack-logo@2x.png" width="200px"></img>](https://www.browserstack.com/)

for which you will need to configure environment variables for `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESSKEY`.

## Release checklist

1. Run `grunt release:<type>` (where `type` is "major", "minor", "patch", "prepatch")
2. Run `grunt release:deploy`
3. Visit [tags](https://github.com/ably-forks/vcdiff-decoder/tags) and draft new release for the newly created tag
