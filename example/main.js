'use strict';

const canvas = document.querySelector('.graph canvas');
const xMin = -0, xMax = 12;
const yMin = -0, yMax = 12;

const points = [];

canvas.addEventListener('click', function(e) {
	let w = canvas.width;
	let h = canvas.height;
	let p = [e.offsetX/w*(xMax-xMin) + xMin, e.offsetY/h*(yMax-yMin) + yMin];

	points.push(p);
	
	console.log(p);
	draw.points([p]);
});



const yAxis = document.querySelector('.graph .y-axis');
const canvasWrap = document.querySelector('.graph .canvas-wrapper');
const canvasWrapStyle = window.getComputedStyle(canvasWrap, null);

const draw = new Draw(canvas, xMin, xMax, yMin, yMax);

resizeGraph();
window.addEventListener('resize', resizeGraph);

function resizeGraph() {
	let w = parseFloat(canvasWrapStyle.getPropertyValue('width'));
	let paddingX = parseFloat(canvasWrapStyle.getPropertyValue('padding-left'));
	let paddingY = parseFloat(canvasWrapStyle.getPropertyValue('padding-top'));
	
	let h = w - 2*paddingX + 2*paddingY;
	canvasWrap.style.height = h + 'px';
	yAxis.style.height = h + 'px';
	
	canvas.width = canvas.scrollWidth;
	canvas.height = canvas.scrollHeight;
	
	draw.points(points);
}



points.push([2,1], [10,5], [3,7]);


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

//gmm.addPoint([2,1]);
//gmm.addPoint([10,5]);
//gmm.addPoint([3,7]);

points.forEach(function(p) {gmm.addPoint(p)});

draw.points(points);

//draw.ellipse(gmm.means[0], gmm.covariances[0]);
//draw.ellipse(gmm.means[1], gmm.covariances[1]);
//draw.ellipse(gmm.means[2], gmm.covariances[2]);

gmm.runEM(1);

draw.ellipse(gmm.means[0], gmm.covariances[0]);
draw.ellipse(gmm.means[1], gmm.covariances[1]);
draw.ellipse(gmm.means[2], gmm.covariances[2]);


console.log(gmm.weights);
console.log(gmm.means);
console.log(gmm.covariances);
