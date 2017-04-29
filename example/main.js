'use strict';

const canvas = document.querySelector('.graph canvas');
const xMin = -100, xMax = 100;
const yMin = -100, yMax = 100;

const points = [];
let gmm = null;

points.push([-49,64],[-48,57],[-44,58],[-42,52],[-37,45],[-37,49],[-40,55],[-34,47],[-31,43],[-32,40],[-37,42],[-42,48],[-46,54],[-31,39],[-28,41],[-28,38],[-34,37],[-31,0],[-37,0],[-44,-7],[-51,-17],[-51,-28],[-41,-30],[-24,-20],[-18,-14],[-20,-4],[-26,-1],[-34,-27],[-27,-9],[-35,-13],[-45,-20],[-35,-19],[-31,-15],[-35,-5],[-40,-14],[-38,-16],[-36,-14],[-33,-12],[-30,-10],[57,-34],[54,-37],[52,-38],[50,-41],[46,-45],[45,-46],[42,-51],[39,-55],[37,-58],[34,-62],[30,-66],[27,-69],[25,-72],[22,-77],[19,-80],[17,-83],[14,-86],[12,-89],[24,-74],[26,-68],[28,-65],[31,-61],[35,-58],[37,-57],[38,-54],[43,-50],[37,-60],[36,-61],[34,-63],[29,-66],[21,-32],[28,-39],[38,-43],[55,-49],[66,-43],[72,-33],[73,-17],[62,-7],[52,-1],[40,-1],[32,-3],[25,-9],[23,-20],[28,-28],[60,-29],[63,-26],[42,-47],[42,-52],[46,-49],[49,-43],[38,-48],[40,-51],[33,-55],[32,-65],[41,-12],[36,-17],[57,-14],[63,-17],[63,-33],[54,-22],[43,-23],[41,-35],[59,-40],[49,-28],[49,-18],[33,-33],[37,-27],[47,-35],[49,-21],[46,-26],[51,-28],[55,-26]);


canvas.addEventListener('click', function(e) {
	let w = canvas.width;
	let h = canvas.height;
	let p = [e.offsetX/w*(xMax-xMin) + xMin, e.offsetY/h*(yMax-yMin) + yMin];

	points.push(p);
	if(gmm) gmm.addPoint(p);
	redraw();
});


function points2string() {
	console.log(
		points
			.map(p => [Math.round(p[0]), Math.round(p[1])])
			.map(p => '[' + p.toString() + ']')
			.join(',')
	);
}


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
	
	redraw();
}

function redraw() {
	canvas.width = canvas.width; // clean
	draw.points(points);
	if(gmm) {
		for(let i=0; i<gmm.clusters; i++) {
			draw.ellipse(gmm.means[i], gmm.covariances[i]);
		}
	}
}



//points.push([2,1], [10,5], [3,7]);


//var gmm = new GMM({
//	dimensions: 2,
//	bufferSize: 1000,
//	weights: [1/3, 1/3, 1/3],
//	means: [[3,4],[6,3],[4,6]],
//	covariances: [
//		[[3,0],[0,3]],
//		[[3,0],[0,3]],
//		[[3,0],[0,3]]
//	]	
//});


//points.forEach(p => gmm.addPoint(p));


//draw.ellipse(gmm.means[0], gmm.covariances[0]);
//draw.ellipse(gmm.means[1], gmm.covariances[1]);
//draw.ellipse(gmm.means[2], gmm.covariances[2]);

//gmm.runEM(1);

//draw.ellipse(gmm.means[0], gmm.covariances[0]);
//draw.ellipse(gmm.means[1], gmm.covariances[1]);
//draw.ellipse(gmm.means[2], gmm.covariances[2]);


//console.log(gmm.weights);
//console.log(gmm.means);
//console.log(gmm.covariances);
