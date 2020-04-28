"use strict";

const path = require('path');
const fs = require('fs');

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
				commitMessage: 'Regenerate and release version %VERSION%',
				commitFiles: [], // see task release:git-add-generated
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
						timeout: 30000
					}
				},
				captureTimeout: 120000,
				concurrency: 2,
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

	grunt.registerTask('publish-cdn',
		'Deploys to the Ably CDN. Requires infrastructure repository relative to here.',
		function() {
			let name = 'infrastructure';
			let prefix = '../';

			var infrastructurePath = '../infrastructure',
					maxTraverseDepth = 3,
					infrastructureFound;

			let folderExists = function(relativePath) {
				try {
					let fileStat = fs.statSync(infrastructurePath);
					if (fileStat.isDirectory()) {
						return true;
					}
				} catch (e) { /* does not exist */ }
			}

			while (infrastructurePath.length <= name.length + (maxTraverseDepth * prefix.length)) {
				grunt.verbose.writeln('Looking for infrastructure repo at: "' + infrastructurePath + "'.");
				if (infrastructureFound = folderExists(infrastructurePath)) {
					break;
				} else {
					infrastructurePath = prefix + infrastructurePath;
				}
			}
			if (!infrastructureFound) {
				grunt.fatal('Infrastructure repo could not be found in any parent folders up to a folder depth of ' + maxTraverseDepth + '.');
			}
			grunt.verbose.ok('Found infrastructure repo at: "' + infrastructurePath + '"');

			var version = grunt.file.readJSON('package.json').version,
					cmd = 'BUNDLE_GEMFILE="' + infrastructurePath + '/Gemfile" bundle exec ' + infrastructurePath + '/bin/ably-env deploy vcdiff-decoder --version ' + version;
			grunt.verbose.writeln('Publishing version ' + version + ' of the library to the CDN...');

			let done = this.async();
			require('child_process').exec(cmd, function(error, stdout, stderr) {
				if (null === error) {
					// Success
					grunt.log.ok('Version ' + version + ' published to the CDN.');
					done();
					return;
				}

				// Failure
				grunt.log.error(error);
				grunt.log.writeln('\n\nexec stdout:\n' + stdout);
				grunt.log.writeln('\n\nexec stderr:\n' + stderr);
				done(false);
			});
		}
	);

	/**
	 * We need this task for a couple of reasons.
	 * 
	 * First, and most critical, is the fact that grunt-bump's bump-commit fails if commitFiles are not in the root - i.e.:
	 *   Running "bump::commit-only" (bump) task
	 *   Fatal error: Can not create the commit:
     *   error: pathspec 'dist/vcdiff-decoder.js' did not match any file(s) known to git
     *   error: pathspec 'dist/vcdiff-decoder.min.js' did not match any file(s) known to git
	 * 
	 * Secondly, grunt-bump adds files atomically in the git commit command, meaning that we cannot force it to
	 * add files that would otherwise have been ignored because they're covered by our .gitignore file. In our case
	 * this is the /dist folder.
	 */
	grunt.registerTask('release:git-add-generated',
		'Adds generated files to the git staging area', function() {
			var done = this.async();
			var generatedFiles = [
				'package.json',
				'dist/vcdiff-decoder.js',
				'dist/vcdiff-decoder.min.js'
			];

			// Using --force so the /dist folder can remain in .gitignore
			var cmd = 'git add --force -A ' + generatedFiles.join(' ');
			grunt.log.writeln('Executing "' + cmd + '"...');

			require('child_process').exec(cmd, function(err, stdout, stderr) {
				if (err) {
					grunt.log.error('git add . -A failed with:\n' + err + '\n\nstderr:\n' + stderr + '\n\nstdout:\n' + stdout);
					done(false);
				}
				done();
			});
		}
	);

	grunt.registerTask('release',
		'Increments the version, regenerates from source (build / bundle), then makes a tagged commit. Run as "grunt release:type", where "type" is "major", "minor", "patch", "prepatch", etc.)',
		versionType => {
			grunt.task.run([
				'bump-only:' + versionType,
				'build',
				'release:git-add-generated',
				'bump-commit'
			]);
		}
	);
};
