[![Build Status](https://travis-ci.org/lukapopijac/gaussian-mixture-model.svg?branch=master)](https://travis-ci.org/lukapopijac/gaussian-mixture-model)

Gaussian Mixture Model
======================

Unsupervised machine learning with multivariate Gaussian mixture model
which supports both offline data and real-time data stream.

Demo: [https://lukapopijac.github.io/gaussian-mixture-model/](https://lukapopijac.github.io/gaussian-mixture-model/)

Installation
------------

```
npm install gaussian-mixture-model
```


Usage
-----
In `Node.js`, simply require:
```javascript
const GMM = require('gaussian-mixture-model');
```

For browser use, include [dist/gmm.js](https://github.com/lukapopijac/gaussian-mixture-model/blob/master/dist/gmm.js) 
file in your project. It will create a global variable `GMM`.


Simple Example
--------------
```javascript
// initialize model
var gmm = new GMM({
	weights: [0.5, 0.5],
	means: [[-25, 40], [-60, -30]],
	covariances: [
		[[400,0],[0,400]],
		[[400,0],[0,400]]
	]
});

// create some data points
var data = [
	[11,42],[19,45],[15,36],[25,38],[24,33],
	[-24,3],[-31,-4],[-34,-14],[-25,-5],[-16,7]
];

// add data points to the model
data.forEach(p => gmm.addPoint(p));

// run 5 iterations of EM algorithm
gmm.runEM(5);

// predict cluster probabilities for point [-5, 25]
var prob = gmm.predict([-5, 25]);  // [0.000009438559331418772, 0.000002126123537376676]

// predict and normalize cluster probabilities for point [-5, 25]
var probNorm = gmm.predictNormalize([-5, 25]);  // [0.8161537535012295, 0.18384624649877046]
```


License
-------
This software is released under the MIT license.
