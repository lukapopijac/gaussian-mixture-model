'use strict';

let canvas = document.querySelector('.graph canvas');
/*


canvas.addEventListener('click', function(e) {
	console.log(e.offsetX, e.offsetY);
	console.log(canvas.width, canvas.height);
	
	var wpx = canvas.scrollWidth;
	var hpx = canvas.scrollHeight;
	
	console.log(wpx, hpx, wpx/hpx);
	
	var xMin = -100;
	var xMax = 100;
});
*/


let container = document.querySelector('.container');
let canvasWrap = document.querySelector('.graph .canvas-wrapper');
let yAxis = document.querySelector('.graph .y-axis');
let axisThick = yAxis.getBoundingClientRect().width;
let graph = document.querySelector('.graph');

window.addEventListener('resize', function() {
	var w = canvasWrap.getBoundingClientRect().width | 0;
	canvasWrap.style.height = w + 'px';
	yAxis.style.height = w + 'px';
	//container.style.maxHeight = (w + axisThick) + 'px';
	//graph.style.height = (w + axisThick) + 'px';
});



/*
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
*/