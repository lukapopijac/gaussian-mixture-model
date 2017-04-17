module.exports = function(opts) {
	
	
};

function em({dimensions: d, weights, means, covariances, data}) {
	let clusters = weights.length;
	
	let cResps = Array(clusters);
	for(let k=0; k<clusters; k++) {
		cResps[k] = Array(data.length);
	}
	let tmpArr = Array(data.length);  // will hold sums of cluster resp., and inverses of those sums
	
	// ****  E-step  ****
	
	// cResps[cluster_idx][data_idx]
	
	tmpArr.fill(0);
	for(let k=0; k<clusters; k++) {
		let resps = cResps[k];
		let weight = weights[k];
		let mean = means[k];
		let cov = covariances[k];

		for(let i=0; i<data.length; i++) {
			tmpArr[i] += resps[i] = weight * pdf(data[i], mean, cov);
		}
	}
	
	for(let i=0; i<data.length; i++) tmpArr[i] = 1/tmpArr[i];
	
	for(let k=0; k<clusters; k++) {
		let resps = cResps[k];
		for(let i=0; i<data.length; i++) {
			resps[i] *= tmpArr[i];
		}
		//console.log(k, resps.map(x=>x.toFixed(9)));
	}
	
	// ****  M-step  ****
	
	for(let k=0; k<clusters; k++) {
		let resps = cResps[k];
		
		// weights
		let softCount = 0;
		for(let i=0; i<data.length; i++) {
			softCount += resps[i];
		}
		weights[k] = softCount / data.length;
		let scInv = 1/softCount;
		
		// means
		let mean = means[k].fill(0);
		for(let i=0; i<data.length; i++) {
			for(let t=0; t<d; t++) {
				mean[t] += resps[i]*data[i][t];
			}
		}
		for(let t=0; t<d; t++) mean[t] *= scInv;
		
		// covariances
		let cov = covariances[k];
		for(let t=0; t<d; t++) cov[t].fill(0);		
		
		let diff = Array(d);
		for(let i=0; i<data.length; i++) {
			let datum = data[i];
			
			for(let t=0; t<d; t++) {
				diff[t] = datum[t] - mean[t];
			}
			
			for(let t1=0; t1<d; t1++) {
				for(let t2=0; t2<d; t2++) {
					cov[t1][t2] += resps[i]*diff[t1]*diff[t2];
				}
			}
		}
		for(let t1=0; t1<d; t1++) {
			for(let t2=0; t2<d; t2++) {
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




//var gmm = require('gaussian-mixture-model');
//gmm.init({...});
//gmm.push([4,3]);
//gmm.expectationMaximization(10);

em({
	dimensions: 2,
	bufferSize: 1000,
	weights: [1/3, 1/3, 1/3],
	means: [[3,4],[6,3],[4,6]],
	covariances: [
		[[3,0],[0,3]],
		[[3,0],[0,3]],
		[[3,0],[0,3]]
	],
	data: [[10,5], [2,1], [3,7]]
});

