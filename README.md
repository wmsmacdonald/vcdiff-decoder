# Vcdiff Decoder

[![Build Status](https://travis-ci.org/ably-forks/vcdiff-decoder.svg?branch=main)](https://travis-ci.org/ably-forks/vcdiff-decoder)
[![npm version](https://badge.fury.io/js/%40ably%2Fvcdiff-decoder.svg)](https://badge.fury.io/js/%40ably%2Fvcdiff-decoder)

A Vcdiff decoder written in pure JavaScript.
Supports the Vcdiff format, as specified in [RFC 3284](https://tools.ietf.org/html/rfc3284).

Tested and proven with Vcdiff patch/delta files generated from
[Google](https://github.com/google)'s [open-vcdiff](https://github.com/google/open-vcdiff)
and [Joshua MacDonald](https://github.com/jmacd)'s [xdelta](https://github.com/jmacd/xdelta).

## Installation from npm for Node.js

    npm install @ably/vcdiff-decoder

and require as:

```javascript
const vcdiff = require('@ably/vcdiff-decoder');
```

## Script include for Web Browsers

Include the library in your HTML from our CDN:

```html
<script src="https://cdn.ably.io/lib/vcdiff-decoder.min-1.js"></script>
```

We follow [Semantic Versioning](http://semver.org/). To lock into a major or minor version of the client library, you can specify a specific version number - for example:

* `https://cdn.ably.io/lib/vcdiff-decoder.min-1.js` for latest `1.*` version
* `https://cdn.ably.io/lib/vcdiff-decoder.min-1.0.js` for latest `v1.0.*` version
* `https://cdn.ably.io/lib/vcdiff-decoder.min-1.0.3.js` for version `1.0.3` explicitly

You can load the non-minified version by omitting `min-` from the URL, for example `https://cdn.ably.io/lib/vcdiff-decoder-1.js`.

See [tagged releases](https://github.com/ably-forks/vcdiff-decoder/releases) for available versions.

## Usage

```javascript
const vcdiff = require('@ably/vcdiff-decoder');
let target = vcdiff.decode(delta, source);
```

## Exported Functions

### `decode(delta, source)`

Synchronous decode. Parameters:

* `delta`: [`Uint8Array`](https://nodejs.org/api/buffer.html) - the binary Vcdiff format encoding of the patch/diff information needed to transform `source` to the returned target
* `source`: [`Uint8Array`](https://nodejs.org/api/buffer.html) - the group of bytes to transform to the returned target using by applying `delta`

Returns a `Uint8Array`, the 'target', being the result of applying `delta` to `source`.

## Contributing

### Requirements

The `vcdiff` dev dependency of this project, used for testing, fails to build against [Node.js 9](https://nodejs.org/download/release/latest-v9.x/) and newer.
For this reason, until [#3](https://github.com/ably-forks/vcdiff-decoder/issues/3) has been addressed, the tests must be run against an environment with [Node.js 8](https://nodejs.org/download/release/latest-v8.x/) installed.

At the time of writing this means:

    vcdiff-decoder % node --version
    v8.17.0
    vcdiff-decoder % npm --version
    6.13.4

For those who use
[ASDF](https://github.com/asdf-vm/asdf)
or compatible tooling to manage their Node.js runtime versions, we have included a
[`.tool-versions`](.tool-versions)
file.

### Building

You can trigger a build using Webpack with:

    npm run grunt -- build

which creates `vcdiff-decoder.js` and `vcdiff-decoder.min.js` in the `dist` folder.

### Testing

To run all tests use:

    npm test

Browser testing supported by

[<img src="./resources/Browserstack-logo@2x.png" width="200px"></img>](https://www.browserstack.com/)

for which you will need to configure environment variables for `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESSKEY`.

## Release Procedure

On the `master` branch:

1. Increment the version, regenerate from source (a.k.a. build / bundle) and make a tagged commit which includes the built output from the `/dist` folder by running `npm run grunt -- release:patch` (or "major", "minor" or "prepatch" as appropriate - see [grunt-bump Usage Examples](https://github.com/vojtajina/grunt-bump#usage-examples))
2. Release the tagged commit to Github using `git push origin master --follow-tags`
3. Release to NPM using `npm publish . --access public` ([this package](https://www.npmjs.com/package/@ably/vcdiff-decoder) is configured to require that [2FA](https://docs.npmjs.com/configuring-two-factor-authentication) is used by publishers)
4. Release to Ably's CDN using `npm run grunt -- publish-cdn` (operable by Ably staff only)
5. Visit [tags](https://github.com/ably-forks/vcdiff-decoder/tags) and draft new release for the newly created tag
