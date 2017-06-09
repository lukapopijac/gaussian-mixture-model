'use strict';

module.exports = class {
	constructor({dimensions, weights, means, covariances, bufferSize}) {
		this.dimensions = dimensions;
		this.clusters = means.length;
		this.weights = weights ? weights.slice() : Array(this.clusters).fill(1/this.clusters);
		this.means = means.map(mu => mu.slice());
		this.covariances = covariances.map(cov => cov.map(row => row.slice()));
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
		
		this.singularity = null;
		
		this.covCholeskies = null; // Choleskies = plural of Cholesky :)
		this.covDeterminants = this.covariances.map(cov => determinant(cov));
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

			// calculate Cholesky decompositions of covariances
			if(this.dimensions > 3) {
				this.covCholeskies = Array(this.clusters);
				for(let k=0; k<this.clusters; k++) {
					this.covCholeskies[k] = cholesky(this.covariances[k]);
				}
			}

			// calculate determinants of covariances
			for(let k=0; k<this.clusters; k++) {
				let L = this.covCholeskies && this.covCholeskies[k];
				this.covDeterminants[k] = determinant(this.covariances[k], L);
			}

			// detect singularities
			for(let k=0; k<this.clusters; k++) {
				if(this.covDeterminants[k] <= 0) {
					this.singularity = this.means[k];
					return this.singularity;					
				}
			}
		}
	}	
	
	predict(point) {
		let s = 0;
		let resps = Array(this.clusters);
		for(let k=0; k<this.clusters; k++) {
			let weight = this.weights[k];
			let mean = this.means[k];
			let cov = this.covariances[k];
			let covDet = this.covDeterminants[k];
			let covCholesky = this.covCholeskies && this.covCholeskies[k];
			
			s += resps[k] = weight * pdf(point, mean, cov, covDet, covCholesky);
		}
		let sInv = 1/s;
		for(let k=0; k<this.clusters; k++) resps[k] *= sInv;
		return resps;
	}
};

function runExpectation() {
	this.tmpArr.fill(0, 0, this.dataLength);
	for(let k=0; k<this.clusters; k++) {
		let resps = this.cResps[k];
		let weight = this.weights[k];
		let mean = this.means[k];
		let cov = this.covariances[k];
		let covDet = this.covDeterminants[k];
		let covCholesky = this.covCholeskies && this.covCholeskies[k];
		
		for(let i=0; i<this.dataLength; i++) {
			this.tmpArr[i] += resps[i] = weight * pdf(this.data[i], mean, cov, covDet, covCholesky);
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


const ln2pi = Math.log(2*Math.PI);

function pdf(x, mean, cov, covDet, covCholesky) {  // probability density function
	// covDet and covCholesky are optional parameters
	let d = typeof x == 'number' ? 1 : x.length;
	let detInv, mah2;  //  1/det, mahalanobis^2
	if(d<4) {
		detInv = covDet != null ? 1/covDet : 1/determinant(cov);
		mah2 = detInv * xmuAxmu(adjugate(cov), mean, x);
	} else {
		let L = covCholesky || cholesky(cov);
		detInv = covDet != null ? 1/covDet : 1/determinant(cov, L);
		mah2 = xmuAxmu(inverseFromCholesky(L), mean, x);
	}
	return Math.sqrt(detInv) * Math.exp(-.5*(mah2 + d*ln2pi));
}

function xmuAxmu(A, mu, x) {  // calculate (x-mu)'*A*(x-mu)
	if(typeof x == 'number') return A*(x-mu)*(x-mu);
	else if(x.length==1) return A[0][0]*(x[0]-mu[0])*(x[0]-mu[0]);
	else if(x.length==2) {
		let d0 = x[0]-mu[0], d1 = x[1]-mu[1];
		return A[0][0]*d0*d0 + (A[0][1]+A[1][0])*d0*d1 + A[1][1]*d1*d1;
	}
	let s = 0, n = x.length;
	let i, j;
	for(i=0; i<n; i++) for(j=0; j<n; j++) {
		s += A[i][j]*(x[i]-mu[i])*(x[j]-mu[j]);
	}
	return s;
}

function adjugate(X) {  // works only for X.length <= 3
	if(typeof X == 'number') return 1;
	else if(X.length==1) return [1];
	else if(X.length==2) return [
		[ X[1][1], -X[0][1]],
		[-X[1][0],  X[0][0]]
	];
	else if(X.length==3) {
		let a = X[0][0], b = X[0][1], c = X[0][2];
		let d = X[1][0], e = X[1][1], f = X[1][2];
		let g = X[2][0], h = X[2][1], i = X[2][2];
		return [
			[e*i-f*h, c*h-b*i, b*f-c*e],
			[f*g-d*i, a*i-c*g, c*d-a*f],
			[d*h-e*g, b*g-a*h, a*e-b*d]
		];
	}
}

function determinant(X, choleskyL) {  // choleskyL is optional parameter
	if(typeof X == 'number') return X;
	else if(X.length==1) return X[0][0];
	else if(X.length==2) return X[0][0]*X[1][1]-X[0][1]*X[1][0];
	else if(X.length==3) return (
		X[0][0] * (X[1][1]*X[2][2] - X[1][2]*X[2][1]) +
		X[0][1] * (X[1][2]*X[2][0] - X[1][0]*X[2][2]) +
		X[0][2] * (X[1][0]*X[2][1] - X[1][1]*X[2][0])
	);
	let r = 1;
	let L = choleskyL || cholesky(X);
	for(let i=0; i<A.length; i++) r *= L[i][i];
	return r*r;
}

function cholesky(A) {
	let L = Array(A.length);
	for(let i=0; i<A.length; i++) {
		let Li = L[i] = Array(i);
		for(let j=0; j<i+1; j++) {
			let Lj = L[j];
			let s = A[i][j];
			for(let k=0; k<j; k++) s -= Li[k]*Lj[k];
			Li[j] = i==j ? Math.sqrt(s) : s/Lj[j];
		}
	}
	return L;
}

function inverseFromCholesky(L) {
	// TODO
}
