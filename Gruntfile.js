"use strict";

const webpackConfig = require('./webpack.config');

module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-bump');
	grunt.loadNpmTasks('grunt-webpack');

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
			webpackConfig
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
