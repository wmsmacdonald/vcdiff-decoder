'use strict';

const assert = require('chai').assert;
const vcd = require('vcdiff');

const vcdiffDecoder = require('../');
const VCDiff = require('../lib/vcdiff');

/*describe('vcdiffDecoder', function() {
  let source = new Buffer('test 1');
  let target = new Buffer('test 2');
  let hashedSource = new vcd.HashedDictionary(source);
  let delta = vcd.vcdiffEncodeSync(target, { hashedDictionary: hashedSource });
  //console.log(delta.toString());
  console.log(delta);

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
});*/

describe('vcdiff', function() {
  describe('#_consumeInteger', function() {
    it('should return the integer value', function() {
      let delta = new Buffer([0x56, 0x43, 0x44, 0x0, 0x0, 0xBA, 0xEF, 0x9A, 0x15]);
      let vcdiff = new VCDiff(delta);
      assert.strictEqual(vcdiff._consumeInteger(), 123456789);
    });
  });
});