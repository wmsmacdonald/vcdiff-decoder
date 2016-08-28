'use strict';

const assert = require('chai').assert;
const vcd = require('vcdiff');

const vcdiffDecoder = require('../');
const errors = require('../lib/errors');
const VCDiff = require('../lib/vcdiff');
const Deserialize = require('../lib/deserialize');
const TypedArray = require('../lib/typed_array_util');

describe('vcdiffDecoder', function() {
  let source = 'test 1\n';
  let target = 'test 2\n';
  let hashedSource = new vcd.HashedDictionary(new Buffer(source));
  let delta = new Uint8Array(vcd.vcdiffEncodeSync(new Buffer(target), { hashedDictionary: hashedSource }));

  describe('#decodeSync', function() {
    it('should return the correct target', function() {
      let decodedTarget = vcdiffDecoder.decodeSync(delta, new Uint8Array(source));
      let decodedString = TypedArray.uint8ArrayToString(decodedTarget);
      // make sure decoded is same as target
      assert.strictEqual(decodedString, target.toString());

    });
  });
  /*describe('#decode', function() {
    it('should return a promise that resolves to the correct target', function(done) {
      vcdiffDecoder.decode(delta, source).then((err, decodedTarget) => {
        assert.strictEqual(decodedTarget.toString(), target.toString());
        done();
      });
    });
  });*/
});

describe('vcdiff', function() {
  describe('#_consumeHeader', function() {
    it('should move position up to 5', function () {
      let delta = new Uint8Array([0x56, 0x43, 0x44, 0x0, 0x0]);
      let vcdiff = new VCDiff(delta);
      vcdiff._consumeHeader();
      assert.strictEqual(vcdiff.position, 5);
    });
    it('should throw an error if not a valid vcdiff', function () {
      let delta = new Uint8Array([0x56, 0x42, 0x44, 0x0, 0x0]);
      let vcdiff = new VCDiff(delta);
      try {
        vcdiff._consumeHeader()
      }
      catch (e) {
        assert(e instanceof errors.InvalidDelta);
      }
    });
    it('should throw an error if hdr_indicator is non-zero', function () {
      let delta = new Uint8Array([0x56, 0x43, 0x44, 0x0, 0x1]);
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
      let delta = new Uint8Array([0xBA, 0xEF, 0x9A, 0x15]);
      let vcdiff = new VCDiff(delta);
      assert.strictEqual(vcdiff.position, 0);
    })
  });
  describe('#_decodeWindow', function () {
    it('should return a correct target buffer', function () {
      let sourceString = 'test 1\n';
      let targetString = 'test 2\n';
      let hashedSource = new vcd.HashedDictionary(new Buffer(sourceString));
      // get a real delta - must convert it from Buffer to Uint8Array
      let delta = new Uint8Array(vcd.vcdiffEncodeSync(new Buffer(targetString), { hashedDictionary: hashedSource }));

      let deltaDeserialized, targetWindow;
      let vcdiff = new VCDiff(delta, new Uint8Array(sourceString));
      vcdiff._buildTargetWindow(9);
      let constructedTarget = vcdiff.targetWindows.uint8Arrays[0];
      assert.strictEqual(vcdiff.position, 22);
      assert.strictEqual(TypedArray.uint8ArrayToString(constructedTarget), targetString);
    });
  });
});

describe('Deserialize', function() {
  describe('#integer', function() {
    it('should return the correct value from a multi byte integer', function() {
      // convert VCDIFF linked integer to base10
      let delta = new Uint8Array([0xBA, 0xEF, 0x9A, 0x15]); // 58,
      let { position, value } = Deserialize.integer(delta, 0);
      assert.strictEqual(value, 123456789);
      assert.strictEqual(position, 4);
    });
    it('should return the correct value from a single byte integer', function() {
      // convert VCDIFF linked integer to base10
      let delta = new Uint8Array([43]);
      let { position, value } = Deserialize.integer(delta, 0);
      assert.strictEqual(value, 43);
      assert.strictEqual(position, 1);
    });
  });
  describe('#window', function () {
    it('should return a correct object with data, instructions, and addresses', function () {
      let sourceString = 'test 1\n';
      let targetString = 'test 2\n';
      let hashedSource = new vcd.HashedDictionary(new Buffer(sourceString));
      let delta = new Uint8Array(vcd.vcdiffEncodeSync(new Buffer(targetString), { hashedDictionary: hashedSource }));

      let deltaDeserialized = Deserialize.delta(delta, 9);
      assert.strictEqual(JSON.stringify(deltaDeserialized), JSON.stringify({
        targetWindowLength: 7,
        position: delta.length,
        data: TypedArray.stringToUint8Array(targetString),
        instructions: new Uint8Array([0x08]),
        addresses: new Uint8Array([])
      }));
    });
  });
});

describe('TypedArray', function() {
  describe('#Uint8ArrayList', function() {
    describe('#add', function() {
      it('should complete without error', function() {
        let list = new TypedArray.Uint8ArrayList();
        list.add(new Uint8Array([0, 1, 2]));
      })
    });
    describe('#get', function() {
      it('should get correct value for one array', function() {
        let list = new TypedArray.Uint8ArrayList();
        list.add(new Uint8Array([0, 1, 2]));
        assert.strictEqual(list.get(1), 1);
      });
      it('should get correct value for two arrays', function() {
        let list = new TypedArray.Uint8ArrayList();
        list.add(new Uint8Array([0, 1, 2, 3]));
        list.add(new Uint8Array([4, 5, 6, 7]));
        for (let i = 0; i < 8; i++) {
          assert.strictEqual(list.get(i), i);
        }
      })
    });
  });
});