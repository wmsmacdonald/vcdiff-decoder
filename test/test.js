'use strict';

const fs = require('fs');

const assert = require('chai').assert;
const vcd = require('vcdiff');

const vcdiffDecoder = require('../');
const errors = require('../lib/errors');
const VCDiff = require('../lib/vcdiff');
const TypedArray = require('../lib/typed_array_util');
const instructions = require('../lib/instructions');
const deserializeInteger = require('../lib/deserialize/integer');
const deserializeDelta = require('../lib/deserialize/delta');


describe('vcdiffDecoder', function() {

  describe('#decodeSync', function() {
    it('should return the correct target', function() {
      let sourceString = 'test 1\n';
      let targetString = 'test 2\n';
      let hashedSource = new vcd.HashedDictionary(new Buffer(sourceString));
      let delta = new Uint8Array(vcd.vcdiffEncodeSync(new Buffer(targetString), { hashedDictionary: hashedSource }));

      let decodedTarget = vcdiffDecoder.decodeSync(delta, TypedArray.stringToUint8Array(sourceString));
      let decodedString = TypedArray.uint8ArrayToString(decodedTarget);
      // make sure decoded is same as target
      assert.strictEqual(decodedString, targetString.toString());

    });
    it('should return the correct target for angular', function() {
      let angular12 = fs.readFileSync(__dirname + '/fixtures/angular1.2.min.js');
      let angular15 = fs.readFileSync(__dirname + '/fixtures/angular1.5.min.js');

      let hashedSource = new vcd.HashedDictionary(angular12);
      let delta = new Uint8Array(vcd.vcdiffEncodeSync(angular15, { hashedDictionary: hashedSource }));

      let decodedTarget = vcdiffDecoder.decodeSync(delta, angular12);
      //let decodedString = TypedArray.uint8ArrayToString(decodedTarget);
      // make sure decoded is same as target
      //assert.strictEqual(decodedString, angular15.toString());
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
      let delta = new Uint8Array([0xD6, 0xc3, 0xc4, 0x0, 0x0]);
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
      let delta = new Uint8Array([0xD6, 0xc3, 0xc4, 0x0, 0x1]);
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
  describe('#_consumeWindow', function () {
    it('should return a correct target buffer with VCD_SOURCE', function () {
      let sourceString = 'test 1\n';
      let targetString = 'test 2\n';
      let hashedSource = new vcd.HashedDictionary(new Buffer(sourceString));
      // get a real delta - must convert it from Buffer to Uint8Array
      let delta = new Uint8Array(vcd.vcdiffEncodeSync(new Buffer(targetString), { hashedDictionary: hashedSource }));

      let deltaDeserialized, targetWindow;
      let vcdiff = new VCDiff(delta, TypedArray.stringToUint8Array(sourceString));
      vcdiff.position = 5;
      vcdiff._consumeWindow();

      let constructedTarget = vcdiff.targetWindows.typedArrays[0];
      assert.strictEqual(vcdiff.position, 22);
      assert.strictEqual(TypedArray.uint8ArrayToString(constructedTarget), targetString);
    });
    it('should return a correct target buffer with VCD_TARGET', function () {

    });
    it('should return a correct target buffer with VCD_TARGET', function () {

    });
  });
  describe('#_buildTargetWindow', function () {
    it('should return a correct target buffer', function () {
      let sourceString = 'test 1\n';
      let targetString = 'test 2\n';
      let hashedSource = new vcd.HashedDictionary(new Buffer(sourceString));
      // get a real delta - must convert it from Buffer to Uint8Array
      let delta = new Uint8Array(vcd.vcdiffEncodeSync(new Buffer(targetString), { hashedDictionary: hashedSource }));

      let deltaDeserialized, targetWindow;
      let vcdiff = new VCDiff(delta, TypedArray.stringToUint8Array(sourceString));
      vcdiff._buildTargetWindow(9, TypedArray.stringToUint8Array(sourceString));
      let constructedTarget = vcdiff.targetWindows.typedArrays[0];
      assert.strictEqual(TypedArray.uint8ArrayToString(constructedTarget), targetString);
    });
    it('should return a correct target buffer with angular files', function () {
      let angular12 = fs.readFileSync(__dirname + '/fixtures/angular1.2.min.js');
      let angular15 = fs.readFileSync(__dirname + '/fixtures/angular1.5.min.js');

      let hashedSource = new vcd.HashedDictionary(angular12);
      let delta = new Uint8Array(vcd.vcdiffEncodeSync(angular15, { hashedDictionary: hashedSource }));

      let decodedTarget = vcdiffDecoder.decodeSync(delta, angular12);
      //console.log(decodedTarget);
      let deltaDeserialized, targetWindow;
      let vcdiff = new VCDiff(delta, angular12);
      vcdiff._consumeHeader();
      vcdiff._buildTargetWindow(13, angular12);
      let constructedTarget = vcdiff.targetWindows.typedArrays[0];
      fs.writeFileSync(__dirname + '/fixtures/angular1.5.min.js.reconstructed', Buffer.from(constructedTarget));
      assert.isTrue(TypedArray.equal(constructedTarget, angular15));
    });
  });
});

describe('Deserialize', function() {
  describe('#integer', function() {
    it('should return the correct value from a multi byte integer', function() {
      // convert VCDIFF linked integer to base10
      let delta = new Uint8Array([0xBA, 0xEF, 0x9A, 0x15]); // 58,
      let { position, value } = deserializeInteger(delta, 0);
      assert.strictEqual(value, 123456789);
      assert.strictEqual(position, 4);
    });
    it('should return the correct value from a single byte integer', function() {
      // convert VCDIFF linked integer to base10
      let delta = new Uint8Array([43]);
      let { position, value } = deserializeInteger(delta, 0);
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

      let deltaDeserialized = deserializeDelta(delta, 9);
      assert.strictEqual(JSON.stringify(deltaDeserialized), JSON.stringify({
        targetWindowLength: 7,
        position: delta.length,
        data: TypedArray.stringToUint8Array(targetString),
        instructions: [new instructions.ADD(7)],
        addresses: new Uint8Array([])
      }));
    });
  });
});

describe('TypedArray', function() {
  describe('#compareTypedArrays', function() {
    it('should return false if lengths are different', function() {
      assert.isFalse(TypedArray.equal(new Uint8Array([0x3]), new Uint8Array([0x3, 0x4])));
    });
    it('should return false if values are different', function() {
      assert.isFalse(TypedArray.equal(new Uint8Array([0x3, 0x3]), new Uint8Array([0x3, 0x4])));
    });
    it('should return true if values are the same', function() {
      assert.isTrue(TypedArray.equal(new Uint8Array([0x3, 0x4]), new Uint8Array([0x3, 0x4])));
    });
  });
  describe('#TypedArrayList', function() {
    describe('#add', function() {
      it('should complete without error', function() {
        let list = new TypedArray.TypedArrayList();
        list.add(new Uint8Array([0, 1, 2]));
      })
    });
    describe('#get', function() {
      it('should get correct value for one uint8 array', function() {
        let list = new TypedArray.TypedArrayList();
        list.add(new Uint8Array([0, 1, 2]));
        assert.strictEqual(list.get(1), 1);
      });
      it('should get correct value for two uin16 arrays', function() {
        let list = new TypedArray.TypedArrayList();
        list.add(new Uint8Array([0, 1, 2, 3]));
        list.add(new Uint8Array([4, 5, 6, 7]));
        for (let i = 0; i < 8; i++) {
          assert.strictEqual(list.get(i), i);
        }
      });
      it('should get correct value for two uint16 arrays', function() {
        let list = new TypedArray.TypedArrayList();
        list.add(new Uint16Array([0, 1, 2, 3]));
        list.add(new Uint16Array([4, 5, 6, 7]));
        for (let i = 0; i < 8; i++) {
          assert.strictEqual(list.get(i), i);
        }
      })
    });
  });
});