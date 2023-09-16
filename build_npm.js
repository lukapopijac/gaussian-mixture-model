import {build, emptyDir} from 'https://deno.land/x/dnt/mod.ts';

await emptyDir('./npm');

await build({
	entryPoints: ['./src/index.js'],
	outDir: './npm',
	shims: {
		// see JS docs for overview and more options
		deno: true,
	},
	package: {
		// package.json properties
		name: 'gaussian-mixture-model',
		version: Deno.args[0],
		description: 'Multivariate Gaussian mixture model for real-time data',
		license: 'MIT',
		repository: {
			type: 'git',
			url: 'git+https://github.com/lukapopijac/gaussian-mixture-model.git',
		}
	},
	postBuild() {
		// steps to run after building and before running the tests
		Deno.copyFileSync('LICENSE', 'npm/LICENSE');
		Deno.copyFileSync('README.md', 'npm/README.md');
	},
});
