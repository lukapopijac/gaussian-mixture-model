'use strict';

const fs = require('fs');
const path = require('path');
const browserify = require('browserify');

// create destination folder if it doesn't exist
if(!fs.existsSync('dist')) fs.mkdirSync('dist');

var b = browserify({debug: false})
	.require('./browser.js', {entry: true})
	.bundle()
	.on('error', err => {console.log(err)})
;

b.pipe(fs.createWriteStream(path.join('dist', 'gmm.js')));
b.pipe(fs.createWriteStream(path.join('example', 'gmm.js')));
