document.getElementById('btn-clear').addEventListener('click', function() {
	points.length = 0;
	gmm = null;
	redraw();
});

document.getElementById('btn-run').addEventListener('click', function() {
	if(gmm) {
		let iterations = 1;  // TODO: get from drop-down-list
		gmm.runEM(iterations);
	}
	redraw();
});

document.getElementById('btn-init-clusters').addEventListener('click', function() {
	let sel = document.getElementById('number-of-clusters');
	let clusters = Number(sel.options[sel.selectedIndex].text);
	
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
});

