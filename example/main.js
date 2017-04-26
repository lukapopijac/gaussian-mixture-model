'use strict';

const canvas = document.querySelector('.graph canvas');
const xMin = -100, xMax = 100;
const yMin = -100, yMax = 100;

const points = [];
let gmm;

points.push([-48,67],[-34,-61],[53,14],[49,5],[58,10],[-48,61],[-42,59],[-37,67],[-52,74],[-59,79],[-65,93],[-68,78],[-59,69],[-48,73],[-40,78],[-54,85],[-35,-50],[-48,-42],[-41,-58],[-37,-57],[-42,-50],[-38,-38],[-33,-45],[-22,-59],[-23,-63],[-28,-66],[-30,-50],[-49,-47],[-44,-59],[-38,-69],[-30,-58],[45,11],[40,4],[34,-3],[33,-12],[39,-20],[46,-24],[58,-25],[69,-18],[71,-14],[69,-4],[65,4],[59,5],[52,0],[44,-5],[54,-18],[62,-14],[59,-7],[56,-6],[43,-12],[48,-10],[-48,80],[-74,88],[-86,92],[-77,86],[-63,88],[-87,77],[-73,86],[-80,83],[-74,78],[-63,71],[-42,-45],[-50,-51]);


canvas.addEventListener('click', function(e) {
	let w = canvas.width;
	let h = canvas.height;
	let p = [e.offsetX/w*(xMax-xMin) + xMin, e.offsetY/h*(yMax-yMin) + yMin];

	points.push(p);
	if(gmm) gmm.addPoint(p);
	
	redraw();
	
	//poinst2string();
});


function poinst2string() {
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



function initializeGmm(clusters) {
	let means = Array(clusters);
	let covariances = Array(clusters);
	for(let i=0; i<clusters; i++) {
		means[i] = [
			xMin + Math.random()*(xMax-xMin),
			yMin + Math.random()*(yMax-yMin)
		];
		covariances[i] = [
			[(xMax-xMin)*(xMax-xMin)*.01, 0],
			[0, (yMax-yMin)*(yMax-yMin)*.01]
		];
	}
	
	gmm = new GMM({
		dimensions: 2,
		bufferSize: 1000,
		weights: Array(clusters).fill(1/clusters),
		means,
		covariances		
	});
	
	points.forEach(p => gmm.addPoint(p));
	
	redraw();
}



function runIterations() {   // on 'Run' button click
	if(gmm) {
		let iterations = 1;  // TODO: get from drop-down-list
		gmm.runEM(iterations);
	}
	redraw();
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
