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
	
	singularity(point) {
		let w = this.canvas.width;
		let h = this.canvas.height;
		let {x, y} = this._point2pixel(point);
		
		let margin = 4;    // space between balloon and border of the canvas
		let padding = 14;  // space between text and border of the balloon
		let radius = 7;    // corner radius of the balloon
		let txt = 'SINGULARITY';
		let textHeight = 20;
		this.ctx.font = 'bold ' + textHeight + 'px sans-serif';
		let textWidth = this.ctx.measureText(txt).width;
		this.ctx.scale(1,-1);
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		
		let sgn = y<.5*h ? 1 : -1;  // is balloon above or below the singular point
		
		// calculate center of the text
		let textY = y+100*sgn;
		let textX = x<.5*w ? x+.5*textWidth : x-.5*textWidth;
		if(textX+.5*textWidth+padding+margin>w) textX = w-.5*textWidth-padding-margin;
		if(textX-.5*textWidth-padding-margin<0) textX = .5*textWidth+padding+margin;
		if(textY-.5*textHeight-padding-margin<0) textY = .5*textHeight+padding+margin;
		if(textY+.5*textHeight+padding+margin>h) textY = h-.5*textHeight-padding-margin;
		
		// draw balloon
		this.ctx.beginPath();
		this.ctx.moveTo(x, -y);
		this.ctx.lineTo(textX-15, -textY+(.5*textHeight+padding)*sgn);
		this.ctx.lineTo(textX-.5*textWidth-padding+radius, -textY+(.5*textHeight+padding)*sgn);
		this.ctx.arcTo(
			textX-.5*textWidth-padding, -textY+(.5*textHeight+padding)*sgn, 
			textX-.5*textWidth-padding, -textY+(.5*textHeight+padding-radius)*sgn, 
			radius
		);
		this.ctx.lineTo(textX-.5*textWidth-padding, -textY+(-.5*textHeight-padding+radius)*sgn);
		this.ctx.arcTo(
			textX-.5*textWidth-padding, -textY+(-.5*textHeight-padding)*sgn, 
			textX-.5*textWidth-padding+radius, -textY+(-.5*textHeight-padding)*sgn, 
			radius
		);
		this.ctx.lineTo(textX+.5*textWidth+padding-radius, -textY+(-.5*textHeight-padding)*sgn);
		this.ctx.arcTo(
			textX+.5*textWidth+padding, -textY+(-.5*textHeight-padding)*sgn, 
			textX+.5*textWidth+padding, -textY+(-.5*textHeight-padding+radius)*sgn, 
			radius
		);
		this.ctx.lineTo(textX+.5*textWidth+padding, -textY+(.5*textHeight+padding-radius)*sgn);
		this.ctx.arcTo(
			textX+.5*textWidth+padding, -textY + (.5*textHeight + padding) * sgn, 
			textX+.5*textWidth+padding-radius, -textY + (.5*textHeight + padding) * sgn, 
			radius
		);
		this.ctx.lineTo(textX+15, -textY + (.5*textHeight + padding) * sgn);
		this.ctx.closePath();
		this.ctx.fillStyle = 'rgba(255,30,30,.85)';
		this.ctx.fill();

		// draw text
		this.ctx.fillStyle = 'white';
		this.ctx.fillText(txt, textX, -textY);
	}
};
