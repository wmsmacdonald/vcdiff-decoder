'use strict';

const assert = require('chai').assert;
const vcd = require('vcdiff');

const vcdiffDecoder = require('../');

describe('vcdiff', function() {
  let source = new Buffer('test 1');
  let target = new Buffer('test 2');
  let hashedSource = new vcd.HashedDictionary(source);
  let delta = vcd.vcdiffEncodeSync(target, { hashedDictionary: hashedSource });
  //console.log(delta.toString());

  describe('#decodeSync', function() {
    it('should return the correct target', function() {

      let decodedTarget = vcdiffDecoder.decodeSync(delta, source);
      // make sure decoded is same as target
      assert.strictEqual(decodedTarget.toString(), target.toString());
    });
  });
  describe('#decode', function() {
    it('should return a promise that resolves to the correct target', function(done) {
      vcdiffDecoder.decode(delta, source).then((err, decodedTarget) => {
        assert.strictEqual(decodedTarget.toString(), target.toString());
        done();
      });
    });
  });
});