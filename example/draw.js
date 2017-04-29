'use strict';

// from chi-square distribution
const s50 = Math.sqrt(1.38629);
const s95 = Math.sqrt(5.99146);
const s99 = Math.sqrt(9.21034);

class Draw {
	constructor(canvas, xMin, xMax, yMin, yMax) {
		this.canvas = canvas;
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		this.xRangeInv = 1/(xMax-xMin);
		this.yRangeInv = 1/(yMax-yMin);
		this.ctx = canvas.getContext('2d');
	}
	
	_point2pixel(point) {
		return {
			x: this.canvas.width  * this.xRangeInv*(point[0]-this.xMin),
			y: this.canvas.height * this.yRangeInv*(point[1]-this.yMin)
		};		
	}
	
	points(points, colors) {
		let w = this.canvas.width;
		let h = this.canvas.height;
		for(let i=0; i<points.length; i++) {
			let p = points[i];
			this.ctx.lineWidth = .2;
			this.ctx.strokeStyle = 'black';
			this.ctx.fillStyle = colors ? colors[i] : 'grey';

			this.ctx.beginPath();
			
			let {x, y} = this._point2pixel(p);
			this.ctx.arc(x, y, 3.5, 0, 2*Math.PI);
			
			this.ctx.fill();
			this.ctx.stroke();
		}
	}
	
	ellipse(mean, covariance, color) {   // assuming cov matrix is symmetric
		if(!color) color = 'black';
		let w = this.canvas.width;
		let h = this.canvas.height;
		let a = covariance[0][0];
		let b = covariance[0][1];
		let d = covariance[1][1];
		
		let T = a+d;
		let G = Math.sqrt(T*T*.25-a*d+b*b);
		let lambda1 = .5*T + G;
		let lambda2 = .5*T - G;
		let r1 = Math.sqrt(lambda1)*s95;
		let r2 = Math.sqrt(lambda2)*s95;
		
		// points to pixels (this probably works only for square grid)
		let r1pix = r1 * this.canvas.width  * this.xRangeInv;
		let r2pix = r2 * this.canvas.height * this.yRangeInv;
		
		let theta = Math.atan2(b, lambda1-d);
		
		let {x, y} = this._point2pixel(mean);
		
		this.ctx.globalAlpha = .7;
		this.ctx.strokeStyle = color;
		this.ctx.fillStyle = color;
		this.ctx.lineWidth = 3;
		this.ctx.beginPath();
		this.ctx.ellipse(x, y, r1pix, r2pix, theta, 0, 2*Math.PI);
		//this.ctx.fill();
		this.ctx.stroke();
		this.ctx.globalAlpha = 1;
	}
};
