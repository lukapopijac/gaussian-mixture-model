import Draw from './draw.js';
import GMM from './index.js';

const canvas = document.querySelector('.graph canvas');
const xMin = -100, xMax = 100;
const yMin = -100, yMax = 100;
const draw = new Draw(canvas, xMin, xMax, yMin, yMax);
let gmm = null;

const points = [
	[-49,64],[-48,57],[-44,58],[-42,52],[-37,45],[-37,49],[-40,55],[-34,47],[-31,43],[-32,40],[-37,42],[-42,48],[-46,54],[-31,39],[-28,41],[-28,38],[-34,37],[-31,0],[-37,0],[-44,-7],[-51,-17],[-51,-28],[-41,-30],[-24,-20],[-18,-14],[-20,-4],[-26,-1],[-34,-27],[-27,-9],[-35,-13],[-45,-20],[-35,-19],[-31,-15],[-35,-5],[-40,-14],[-38,-16],[-36,-14],[-33,-12],[-30,-10],[57,-34],[54,-37],[52,-38],[50,-41],[46,-45],[45,-46],[42,-51],[39,-55],[37,-58],[34,-62],[30,-66],[27,-69],[25,-72],[22,-77],[19,-80],[17,-83],[14,-86],[12,-89],[24,-74],[26,-68],[28,-65],[31,-61],[35,-58],[37,-57],[38,-54],[43,-50],[37,-60],[36,-61],[34,-63],[29,-66],[21,-32],[28,-39],[38,-43],[55,-49],[66,-43],[72,-33],[73,-17],[62,-7],[52,-1],[40,-1],[32,-3],[25,-9],[23,-20],[28,-28],[60,-29],[63,-26],[42,-47],[42,-52],[46,-49],[49,-43],[38,-48],[40,-51],[33,-55],[32,-65],[41,-12],[36,-17],[57,-14],[63,-17],[63,-33],[54,-22],[43,-23],[41,-35],[59,-40],[49,-28],[49,-18],[33,-33],[37,-27],[47,-35],[49,-21],[46,-26],[51,-28],[55,-26]
];

const clusterColors = [
	'rgb(228,  26,  28)',
	'rgb( 55, 126, 184)',
	'rgb( 77, 175,  74)',
	'rgb(152,  78, 163)',
	'rgb(255, 127,   0)',
	'rgb(255, 255,  51)',
	'rgb(166,  86,  40)',
];

canvas.addEventListener('click', function(e) {
	let w = canvas.width;
	let h = canvas.height;
	
	let p = [e.offsetX/w*(xMax-xMin) + xMin, e.offsetY/h*(yMax-yMin) + yMin];

	let sel = document.getElementById('number-of-points');
	let n = Number(sel.options[sel.selectedIndex].text);  // number of points
	
	if(n==1) {
		points.push(p);
		if(gmm) gmm.addPoint(p);
	} else for(let i=0; i<n; i++) {
		let alpha = Math.random()*2*Math.PI/n + i/n*2*Math.PI;
		let r = Math.random()*(xMax-xMin)*.04;
		let q = [p[0] + r*Math.cos(alpha), p[1] + r*Math.sin(alpha)];
		points.push(q);
		if(gmm) gmm.addPoint(q);
	}
	
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


resizeGraph();
window.addEventListener('resize', resizeGraph);

function resizeGraph() {
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	redraw();
}


function redraw() {
	draw.clearAll();
	if(gmm) {
		let pointColors = points
			.map(p => gmm.predict(p))
			.map(probs => probs.reduce(
				(iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0
			))
			.map(i => clusterColors[i])
		;
		for(let i=0; i<gmm.clusters; i++) {
			draw.ellipse(gmm.means[i], gmm.covariances[i], clusterColors[i]);
		}
		draw.points(points, pointColors);

		if(gmm.singularity) draw.singularity(gmm.singularity);
	} else {
		draw.points(points);
	}
}



document.getElementById('btn-clear').addEventListener('click', function() {
	points.length = 0;
	gmm = null;
	redraw();
});

document.getElementById('btn-run-a').addEventListener('click', _ => run(1));
document.getElementById('btn-run-b').addEventListener('click', _ => run(10));

document.getElementById('btn-init-clusters').addEventListener('click', function() {
	initializeGmm();
	redraw();
});


function run(iterations) {
	if(gmm) {
		if(gmm.singularity) return;
		gmm.runEM(iterations);
	} else {
		initializeGmm();
	}
	redraw();
}

function initializeGmm() {
	let sel = document.getElementById('number-of-clusters');
	let clusters = Number(sel.options[sel.selectedIndex].text);
	
	let dx = xMax-xMin;
	let dy = yMax-yMin;
	
	let means = Array(clusters).fill(0)
		.map(_ => [xMin + Math.random()*dx, yMin + Math.random()*dy]);
	
	let covariances = Array(clusters).fill(0)
		.map(_ => [[dx*dx*.01, 0], [0, dy*dy*.01]]);
	
	gmm = new GMM({
		dimensions: 2,
		bufferSize: 1000,
		weights: Array(clusters).fill(1/clusters),
		means,
		covariances		
	});
	
	points.forEach(p => gmm.addPoint(p));
}
