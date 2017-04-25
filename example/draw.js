'use strict';

const s95 = 2*Math.sqrt(5.991);
const s99 = 2*Math.sqrt(9.21);

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
	
	_point2pixel(point, w, h) {
		return {
			x: w*this.xRangeInv*(point[0]-this.xMin),
			y: h*this.yRangeInv*(point[1]-this.yMin)
		};		
	}
	
	points(points, colors) {
		let w = this.canvas.width;
		let h = this.canvas.height;
		for(let i=0; i<points.length; i++) {
			let p = points[i];
			this.ctx.lineWidth = .2;
			this.ctx.strokeStyle = 'black';
			this.ctx.fillStyle = 'red';

			this.ctx.beginPath();
			
			let {x, y} = this._point2pixel(p, w, h);
			this.ctx.arc(x, y, 3, 0, 2*Math.PI);
			
			this.ctx.fill();
			this.ctx.stroke();
		}
	}
	
	ellipse(mean, covariance) {   // assuming cov matrix is symmetric
		let a = covariance[0][0];
		let b = covariance[0][1];
		let d = covariance[1][1];
		
		let T = a+d;
		let G = Math.sqrt(T*T*.25-a*d-b*b);
		let lambda1 = .5*T + G;
		let lambda2 = .5*T - G;
		let r1 = Math.sqrt(lambda1)*s99;
		let r2 = Math.sqrt(lambda2)*s99;
		
		let theta = Math.atan2(b, lambda1-d);
		
		let {x, y} = this._point2pixel(mean, this.canvas.width, this.canvas.height);
		
		this.ctx.strokeStyle = 'black';
		this.ctx.strokeWidth = '5px';
		this.ctx.beginPath();
		this.ctx.ellipse(x, y, r1, r2, theta, 0, 2*Math.PI);
		this.ctx.stroke();
	}
};
