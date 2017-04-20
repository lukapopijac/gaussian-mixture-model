'use strict';

const fs = require('fs');
const path = require('path');

// create destination folder if it doesn't exist
if(!fs.existsSync('dist')) fs.mkdirSync('dist');

function wrapForBrowser(code) {
	return 'var GMM = function(module){\n' + code + 'return module.exports}({});';
}

let source = fs.readFileSync('index.js');

fs.writeFileSync(path.join('package', 'index.js'), source);
fs.writeFileSync(path.join('dist', 'gmm.js'), wrapForBrowser(source));
fs.writeFileSync(path.join('example', 'gmm.js'), wrapForBrowser(source));

// copy package.json
fs.writeFileSync(path.join('package', 'package.json'), fs.readFileSync('package.json'));
