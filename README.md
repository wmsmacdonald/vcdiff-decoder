# vcdiff-decoder

[![Build Status](https://travis-ci.org/ably-forks/vcdiff-decoder.svg?branch=master)](https://travis-ci.org/ably-forks/vcdiff-decoder)
[![npm version](https://badge.fury.io/js/%40ably%2Fvcdiff-decoder.svg)](https://badge.fury.io/js/%40ably%2Fvcdiff-decoder)

Pure JavaScript vcdiff decoder. Tested and proven working with vcdiff patch/delta files generated from Google's [open-vcdiff](https://github.com/google/open-vcdiff) and [xdelta](https://github.com/jmacd/xdelta)


```javascript
const vcdiff = require('@ably/vcdiff-decoder');

let target = vcdiff.decodeSync(deltaBuffer, new Buffer('some dictionary string buffer'));
console.log(target.toString());
```

## API
### vcdiff.decodeSync(delta, source)
* `delta` Buffer
* `source` Buffer

Returns a `Buffer` object of the target.

`delta` is the binary encoding of the information needed to transform the source to the target. It is encoded as vcdiff, as specified in [RFC 3284](https://tools.ietf.org/html/rfc3284)

`source` is the group of bytes to transform into the target. In delta encoding, this probably an old, cached version.

### vcdiff.decode(delta, source)

Same as above except returns a `Promise` that either resolves with the target `Buffer` or rejects with an error.

## Contributing

### Testing
To run all tests use

    npm test

Browser testing supported by

[<img src="./resources/Browserstack-logo@2x.png" width="200px"></img>](https://www.browserstack.com/)

## Release checklist

1. Run `grunt release:<type>` (where `type` is "major", "minor", "patch", "prepatch")
2. Run `grunt release:deploy`
3. Visit [https://github.com/ably-forks/vcdiff-decoder/tags](https://github.com/ably-forks/vcdiff-decoder/tags) and draft new release for the newly created tag