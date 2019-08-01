var path = require('path');

const entry = './lib/vcdiff_decoder.js';
const outputPath = path.resolve(__dirname, 'dist');

module.exports = [{
	mode: 'none',	// Opts out of any default optimization options
	entry,
	output: {
		path: outputPath,
		filename: 'vcdiff-decoder.js',
		library: 'vcdiffDecoder'
	}
}, {
	mode: 'production',
	entry,
	output: {
		path: outputPath,
		filename: 'vcdiff-decoder.min.js',
		library: 'vcdiffDecoder'
	}
}];
