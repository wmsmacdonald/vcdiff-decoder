'use strict';

const assert = require('chai').assert;

describe('vcdiffDecoder', function() {
	describe('#decodeSync', function() {
		for (var i = 1; i <= 4; i++) {
			var fixture = i;
			it('should properly decode Xdelta generated patches - ' + fixture, function(done) {
				getXdeltaFixtureFiles(fixture, function(err, dictionary, delta, target) {
					if (err) {
						assert.isTrue(false, err);
						done();
						return;
					}

					let decodedTarget = vcdiffDecoder.decodeSync(delta, dictionary);
					let decodedBuffer = Buffer.from(decodedTarget);
					assert.isTrue(decodedBuffer.equals(Buffer.from(target)), 'The result from decodeSync() should match the target.');
					done();
				});
			});
		}
	});
});

function getXdeltaFixtureFiles(fixture, callback) {
	getXdeltaFixtureFile(fixture, 'dictionary', function(err, dictionary) {
		if (err) {
			callback('Failed to read fixture file. Error: ' + err);
		}

		getXdeltaFixtureFile(fixture, 'delta', function(err, delta) {
			if (err) {
				callback('Failed to read fixture file. Error: ' + err);
			}

			getXdeltaFixtureFile(fixture, 'target', function(err, target) {
				if (err) {
					callback('Failed to read fixture file. Error: ' + err);
				}

				callback(null, dictionary, delta, target);
			});
		});
	});
}

function getXdeltaFixtureFile(fixture, file, callback) {
	var request = new XMLHttpRequest();
	request.open("GET", 'https://raw.githubusercontent.com/ably-forks/vcdiff-decoder/master/test/fixtures/xdelta/' + fixture + '/' + file);
	request.responseType = "arraybuffer";
	request.onreadystatechange = function() {
		if(request.readyState === 4) {
			if(request.status === 200) {
				callback(null, new Uint8Array(request.response));
			} else {
				callback('Status code: ' + request.status);
			}
		};
	}
	request.send();
}
