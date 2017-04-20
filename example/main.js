var gmm = new GMM({
	dimensions: 2,
	bufferSize: 1000,
	weights: [1/3, 1/3, 1/3],
	means: [[3,4],[6,3],[4,6]],
	covariances: [
		[[3,0],[0,3]],
		[[3,0],[0,3]],
		[[3,0],[0,3]]
	]	
});

gmm.addPoint([2,1]);
gmm.addPoint([10,5]);
gmm.addPoint([3,7]);

gmm.runEM(1);

console.log(gmm.weights);
console.log(gmm.means);
console.log(gmm.covariances);
