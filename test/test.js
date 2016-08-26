'use strict';

const assert = require('chai').assert;
const vcd = require('vcdiff');

const vcdiffDecoder = require('../');
const errors = require('../lib/errors');
const VCDiff = require('../lib/vcdiff');
const Deserialize = require('../lib/deserialize');
const vcdiffTargetWindow = require('../lib/vcdiff_target_window');

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
  describe('#_consumeHeader', function() {
    it('should move position up to 5', function () {
      let delta = new Buffer([0x56, 0x43, 0x44, 0x0, 0x0]);
      let vcdiff = new VCDiff(delta);
      vcdiff._consumeHeader();
      assert.strictEqual(vcdiff.position, 5);
    });
    it('should throw an error if not a valid vcdiff', function () {
      let delta = new Buffer([0x56, 0x42, 0x44, 0x0, 0x0]);
      let vcdiff = new VCDiff(delta);
      try {
        vcdiff._consumeHeader()
      }
      catch (e) {
        assert(e instanceof errors.InvalidDelta);
      }
    });
    it('should throw an error if hdr_indicator is non-zero', function () {
      let delta = new Buffer([0x56, 0x43, 0x44, 0x0, 0x1]);
      let vcdiff = new VCDiff(delta);
      try {
        vcdiff._consumeHeader();
        assert.fail();
      }
      catch (e) {
        assert.strictEqual(e.name, 'NotImplemented');
      }
    });
  });
  describe('#position', function() {
    it('starts at zero', function() {
      let delta = new Buffer([0xBA, 0xEF, 0x9A, 0x15]);
      let vcdiff = new VCDiff(delta);
      assert.strictEqual(vcdiff.position, 0);
    })
  });

});

describe('Deserialize', function() {
  describe('#integer', function() {
    it('should return the correct value from a multi byte integer', function() {
      // convert VCDIFF linked integer to base10
      let delta = new Buffer([0xBA, 0xEF, 0x9A, 0x15]); // 58,
      let { nextPosition, value } = Deserialize.integer(delta, 0);
      assert.strictEqual(value, 123456789);
      assert.strictEqual(nextPosition, 4);
    });
    it('should return the correct value from a single byte integer', function() {
      // convert VCDIFF linked integer to base10
      let delta = new Buffer([43]);
      let { nextPosition, value } = Deserialize.integer(delta, 0);
      assert.strictEqual(value, 43);
      assert.strictEqual(nextPosition, 1);
    });
  });
});

describe('vcdiffTargetWindow', function() {
  describe('.FromSource', function() {
    describe('#decode', function () {
      it('should return the correct value from a multi byte integer', function () {
        let source = new Buffer('test 1\n');
        let target = new Buffer('test 2\n');
        let hashedSource = new vcd.HashedDictionary(source);
        let delta = vcd.vcdiffEncodeSync(target, { hashedDictionary: hashedSource });


        //let delta = new Buffer([0x0d, 0x07, 0x00, 0x07, 0x01, 0x00, 0x74, 0x65, 0x73, 0x74, 0x20, 0x32, 0xa]);
        let targetWindow = new vcdiffTargetWindow.FromSource(delta, 8);
        assert.strictEqual(JSON.stringify(targetWindow.parse()), JSON.stringify({
          nextPosition: 22,
          data: new Buffer('test 2\n'),
          instructions: new Buffer([0x08]),
          addresses: new Buffer([])
        }));
      });
    });
  });
});