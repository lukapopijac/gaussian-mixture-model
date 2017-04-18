'use strict';

/**
important:
This algorithm doesn't handle possible singularity issues. In case of singularities,
result will contain bunch of NaN values.
example: if one of the gaussians is stuck at only one data point, it will shrink
to it and variance will converge to zero.
*/

//module.exports = class {
class GMM {
	constructor({dimensions, weights, means, covariances, bufferSize}) {
		this.dimensions = dimensions;
		this.clusters = means.length;
		this.weights = weights ? weights : Array(this.clusters).fill(1/this.clusters);
		this.means = means;
		this.covariances = covariances;
		this.bufferSize = bufferSize != null ? bufferSize : 1e6;
		
		this.data = Array(this.bufferSize);
		this.idx = 0;          // index of the next data point
		this.dataLength = 0;
		
		// 'tmpArr' will hold sums of cluster resp., and inverses of those sums
		this.tmpArr = new Float32Array(this.bufferSize);
		
		// cluster responsibilities cResps[cluster_idx][data_idx]
		this.cResps = Array(this.clusters);
		for(let k=0; k<this.clusters; k++) {
			this.cResps[k] = new Float32Array(this.bufferSize);
		}
	}
	
	addPoint(point) {		
		this.data[this.idx] = point;
		this.idx++;
		if(this.idx == this.bufferSize) this.idx = 0;
		if(this.dataLength < this.bufferSize) this.dataLength++;
	}
	
	runEM(iterations = 1) {
		if(this.dataLength==0) return;
		for(let i=0; i<iterations; i++) {
			runExpectation.call(this);
			runMaximization.call(this);
		}
	}	
	
	predict(point) {
		
	}
};


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

function runExpectation() {
	this.tmpArr.fill(0, 0, this.dataLength);
	for(let k=0; k<this.clusters; k++) {
		let resps = this.cResps[k];
		let weight = this.weights[k];
		let mean = this.means[k];
		let cov = this.covariances[k];

		for(let i=0; i<this.dataLength; i++) {
			this.tmpArr[i] += resps[i] = weight * pdf(this.data[i], mean, cov);
		}
	}
	
	for(let i=0; i<this.dataLength; i++) this.tmpArr[i] = 1/this.tmpArr[i];
	
	for(let k=0; k<this.clusters; k++) {
		let resps = this.cResps[k];
		for(let i=0; i<this.dataLength; i++) {
			resps[i] *= this.tmpArr[i];
		}
	}
}


function runMaximization() {
	for(let k=0; k<this.clusters; k++) {
		let resps = this.cResps[k];
		
		// soft count of data points in this cluster
		let softCount = 0;
		for(let i=0; i<this.dataLength; i++) {
			softCount += resps[i];
		}
		let scInv = 1/softCount;
		
		// weights
		this.weights[k] = softCount / this.dataLength;
		
		// means
		let mean = this.means[k].fill(0);
		for(let i=0; i<this.dataLength; i++) {
			for(let t=0; t<this.dimensions; t++) {
				mean[t] += resps[i]*this.data[i][t];
			}
		}
		for(let t=0; t<this.dimensions; t++) mean[t] *= scInv;
		
		// covariances
		let cov = this.covariances[k];
		for(let t=0; t<this.dimensions; t++) cov[t].fill(0);		
		
		let diff = Array(this.dimensions);
		for(let i=0; i<this.dataLength; i++) {
			let datum = this.data[i];
			
			for(let t=0; t<this.dimensions; t++) {
				diff[t] = datum[t] - mean[t];
			}
			
			for(let t1=0; t1<this.dimensions; t1++) {
				for(let t2=0; t2<this.dimensions; t2++) {
					cov[t1][t2] += resps[i]*diff[t1]*diff[t2];
				}
			}
		}
		for(let t1=0; t1<this.dimensions; t1++) {
			for(let t2=0; t2<this.dimensions; t2++) {
				cov[t1][t2] *= scInv;
			}
		}
	}
}

// probability density function
function pdf(x, mean, cov) {
	let dimensions = x.length;
	
	if(dimensions==1) {
		// TODO
	} else if(dimensions==2) {
		let a = cov[0][0], b = cov[0][1];
		let c = cov[1][0], d = cov[1][1];
		
		let det = a*d - b*c;
		let detInv = 1/det;  // TODO: this is not safe!
		
		let t0 = x[0]-mean[0];
		let t1 = x[1]-mean[1];
		
		// mahalanobis^2
		let mah2 = detInv * (d*t0*t0 - (b+c)*t0*t1 + a*t1*t1);
		
		return Math.exp(-.5*mah2) * Math.pow(2*Math.PI, -.5*dimensions) * Math.sqrt(detInv);
	} else {
		for(let i=0; i<dimensions; i++) {
			// TODO
		}
	}
}

