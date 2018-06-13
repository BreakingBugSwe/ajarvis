const graphDataOpts = {
	borderWidth: 1.5,
	pointRadius: 0,
	fill: true,
};

const graphOpts = {
	type: 'line',
	options: {
		responsive: true,
		layout: {
			padding: {
				top: 10,
			},
		},
		legend: {
			position: 'bottom',
			labels: {
				boxWidth: 13,
				fontSize: 13,
				padding: 20,
			},
		},
		scales: {
			xAxes: [{
				display: true,
				gridLines: {
					display: false,
				},
				scaleLabel: {
					display: false,
				},
			}],
			yAxes: [{
				display: true,
				gridLines: {
					display: false,
				},
				ticks: {
					beginAtZero: true,
				},
				scaleLabel: {
					display: false,
				},
			}],
		},
	},
};
