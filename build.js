'use strict';

const fs = require('fs');
const path = require('path');

// create destination folder if it doesn't exist
if(!fs.existsSync('dist')) fs.mkdirSync('dist');

let source = fs.createReadStream('index.js');
source.pipe(fs.createWriteStream(path.join('package', 'index.js')));
source.pipe(fs.createWriteStream(path.join('dist', 'gmm.js')));
source.pipe(fs.createWriteStream(path.join('example', 'gmm.js')));
