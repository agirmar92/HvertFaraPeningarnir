var pie = new d3pie("mypie", {
	header: {
		title: {
			text: "",
			color: "#dadada",
			font: "font4",
			fontSize: 24
		},
		location: "pie-center"
	},
	size: {
		canvasWidth: 800,
		canvasHeight: 500
	},
	data: {
		content: [
			{ label: "Fræðslumál", value: 25623456789, color: "#0dad5c" },
			{ label: "MálaflokkurB", value: 7758493758, color: "#ff906d" },
			{ label: "MálaflokkurC", value: 5039485736, color: "#5594ba" },
			{ label: "MálaflokkurD", value: 3657483920, color: "#90e662" },
			{ label: "MálaflokkurE", value: 2916473026, color: "#ffbd6d" },
			{ label: "MálaflokkurF", value: 1647309887, color: "#f16785" },
			{ label: "Annað", value: 587234610, color: "#e6fa6b" },
			{ label: "MálaflokkurA", value: 11909871825, color: "#b352bd" }
		]
	},
	labels: {
		outer: {
			format: "label",
			pieDistance: 50
		},
		inner: {
			hideWhenLessThanPercentage: 100
		},
		mainLabel: {
			color: "#dadada",
			font: "font1",
			fontSize: "18"
		},
		value: {
			color: "#dadada",
			font: "font4",
			fontSize: "12"
		},
		lines: {
			style: "straight"
		}
	},
	misc: {
		colors: {
			segmentStroke: "null"
		},
		gradient: {
			//enabled: "true",
			percentage: 99,
			color: "#1b1b1b"
		}
	},
	effects: {
		load: {
			speed: 800
		},
		pullOutSegmentOnClick: {
			effect: "none"
		}
	},
	tooltips: {
		enabled: true,
		type: "placeholder",
		string: "kr. {value} ({percentage}%) ~",
		styles: {
			color: "#dadada",
			font: "font4",
			fontSize: 14
		},
		placeholderParser: function(index, data) {
			var valueStr = data.value.toString();
			data.value = "";
			var i = valueStr.length;
			var j = 1;
			while (i > 0) {
				if (j % 4 === 0) {
					data.value = '.' + data.value;
				} else {
					data.value = valueStr[i-1] + data.value;
					i--;
				}
				j++;
			}
		}
	}
});



