"use strict";

const path = require('path');

module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-bump');
	grunt.loadNpmTasks('grunt-webpack');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-karma');

	grunt.initConfig({
		bump: {
			options: {
				files: ['package.json'],
				commit: true,
				commitMessage: 'Release version %VERSION%',
				commitFiles: ['package.json'],
				createTag: true,
				tagName: '%VERSION%',
				tagMessage: 'Version %VERSION%',
				push: false,
				prereleaseName: 'beta'
			}
		},
		webpack: {
			options: {
				entry: './lib/vcdiff_decoder.js',
				output: {
					path: path.resolve(__dirname, 'dist'),
					library: 'vcdiffDecoder'
				},
				module: {
					rules: [
						{
							test: /\.js$/,
							include: [
								path.resolve(__dirname, 'lib'),
							],
							use: {
								loader: 'babel-loader',
								options: {
									presets: [
										[
											'@babel/preset-env',
											{
												'useBuiltIns': 'usage',
												'corejs': 3,
												'modules': 'commonjs'
											}
										]
									]
								}
							}
						}
					]
				}
			},
			'vcdiff-decoder.js': {
				mode: 'none',	// Opts out of any default optimization options
				output: {
					filename: 'vcdiff-decoder.js'
				}
			},
			'vcdiff-decoder.min.js': {
				mode: 'production',
				output: {
					filename: 'vcdiff-decoder.min.js'
				}
			}
		},
		karma: {
			options: {
				frameworks: ['mocha'],
				files: [
					'dist/<%= grunt.task.current.args[0] %>',
					'test/browser-tests.js'
				],
				preprocessors: {
					'test/browser-tests.js': ['webpack', 'sourcemap']
				},
				webpack: {
					mode: 'none',
					devtool: 'inline-source-map',
					module: {
						rules: [
							{
								use: {
									loader: 'babel-loader',
									options: {
										presets: [
											'@babel/preset-env'
										]
									}
								}
							}
						]
					}
				},
				client: {
					mocha: {
						timeout: 10000
					}
				},
				captureTimeout: 120000,
				singleRun: true
			},
			local: {
				reporters: ['progress', 'mocha'],
				browsers: ['Firefox'],
			},
			remote: {
				browserStack: {
					username: process.env.BROWSERSTACK_USERNAME,
					accessKey: process.env.BROWSERSTACK_ACCESSKEY
				},
				reporters: ['dots', 'BrowserStack'],
				customLaunchers: {
					// BrowserStack launchers. List here: https://www.browserstack.com/list-of-browsers-and-platforms?product=automate
					// To get actual values run `curl -u "BROWSERSTACK_USERNAME:BROWSERSTACK_ACCESSKEY" https://api.browserstack.com/automate/browsers.json | json_pp`
					bs_firefox_sierra: { base: 'BrowserStack', browser: 'firefox', browser_version: '60.0', os: 'OS X', os_version: 'Sierra' },
					bs_chrome_sierra: { base: 'BrowserStack', browser: 'chrome', browser_version: '66.0', os: 'OS X', os_version: 'Sierra' },
					bs_ie11_win10: { base: 'BrowserStack', browser: 'ie', browser_version: '11.0', os: 'Windows', os_version: '10' },
					bs_ie10_win81: { base: 'BrowserStack', browser: 'ie', browser_version: '10.0', os: 'Windows', os_version: '8' },
					bs_ie16_win10: { base: 'BrowserStack', browser: 'edge', browser_version: '16.0', os: 'Windows', os_version: '10' },
					bs_safari_11_iOS: { base: 'BrowserStack', browser: 'Mobile Safari', os: 'ios', os_version: '11.0', real_devices: ['iPhone SE'] },
					bs_safari_high_sierra: { base: 'BrowserStack', browser: 'Safari', browser_version: '11.1', os: 'OS X', os_version: 'High Sierra' },
					bs_android_6: { base: 'BrowserStack', browser: 'android', os: 'android', os_version: '6.0', device: 'Google Nexus 6', real_mobile: true }
				},
				browsers: [
					'bs_firefox_sierra',
					'bs_chrome_sierra',
					'bs_ie11_win10',
					'bs_ie10_win81',
					'bs_ie16_win10',
					'bs_safari_11_iOS',
					'bs_safari_high_sierra',
					'bs_android_6'
				]
			}
		},
		mochaTest: {
			node: {
				src: ['test/node-tests.js']
			}
		}
	});

	function execExternal(cmd) {
		return function() {
			var done = this.async();
			grunt.log.ok("Executing " + cmd);
			require('child_process').exec(cmd, function(err, stdout, stderr) {
				if (err) {
					grunt.fatal('Error executing "' + cmd + '": ' + stderr);
				}
				console.log(stdout);
				stderr && console.error(stderr);
				done();
			});
		};
	}

	grunt.registerTask('build', 'webpack');

	grunt.registerTask('test:all', ['test', 'test:browser:remote']);

	grunt.registerTask('test', ['test:node', 'test:browser:local']);

	grunt.registerTask('test:node', 'mochaTest');

	grunt.registerTask('test:browser',
		'Runs browser tests in given context. Run as "grunt test:browser:<context>", where <context> is "local" or "remote"',
		context => {
			grunt.task.run([
				'build',
				`karma:${context}:vcdiff-decoder.js`,
				`karma:${context}:vcdiff-decoder.min.js`
			]);
		}
	);

	grunt.registerTask('release',
		'Bundles the source, increments the version and makes a tagged commit. Run as "grunt release:type", where "type" is "major", "minor", "patch", "prepatch", etc.)',
		versionType => {
			grunt.task.run([
				'build',
				'bump:' + versionType
			]);
		}
	);

	grunt.registerTask('release:git-push', 'Pushes to git', execExternal('git push origin master --follow-tags'));

	grunt.registerTask('release:npm-publish', 'Deploys to npm', execExternal('npm publish . --access public'));

	grunt.registerTask('release:ably-deploy',
		'Deploys to ably CDN, assuming infrastructure repo is in same dir as vcdiff-decoder',
		function() {
			var infrastructurePath = '../infrastructure',
					maxTraverseDepth = 3,
					infrastructureFound;

			var folderExists = function(relativePath) {
				try {
					var fileStat = fs.statSync(infrastructurePath);
					if (fileStat.isDirectory()) {
						return true;
					}
				} catch (e) { /* does not exist */ }
			}

			while (infrastructurePath.length < 'infrastructure'.length + maxTraverseDepth*3) {
				if (infrastructureFound = folderExists(infrastructurePath)) {
					break;
				} else {
					infrastructurePath = "../" + infrastructurePath;
				}
			}
			if (!infrastructureFound) {
				grunt.fatal('Infrastructure repo could not be found in any parent folders up to a folder depth of ' + maxTraverseDepth);
			}
			var version = grunt.file.readJSON('package.json').version,
					cmd = 'BUNDLE_GEMFILE="' + infrastructurePath + '/Gemfile" bundle exec ' + infrastructurePath + '/bin/ably-env deploy vcdiff-decoder --version ' + version;
			console.log('Publishing version ' + version + ' of the library to the CDN');
			//execExternal(cmd).call(this);
		}
	);

	grunt.registerTask('release:deploy', 'Pushes a new release to github and deploys to npm', [
		'release:git-push',
		'release:npm-publish',
		'release:ably-deploy'
	]);
};
