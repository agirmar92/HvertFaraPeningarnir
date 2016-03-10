var hfpApp = angular.module('hvertfarapeningarnir',
	['ngRoute', 'angular-loading-bar', 'ui.bootstrap']);

hfpApp.controller('testController', function ($scope, $http) {
	'user strict';

	$scope.totalAmount = "732.027.971";
	$scope.testData = [];
	$scope.dynamic = 80;
	$scope.max = 100;
	$scope.values = [25623456789, 7758493758, 5039485736, 3657483920, 2916473026, 1647309887, 587234610, 11909871825];

	$scope.reCreate = function() {
		return new d3pie("mypie", {
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
					{ label: "Fræðslumál", 	 value: $scope.values[0], color: "#0dad5c" },
					{ label: "MálaflokkurB", value: $scope.values[1], color: "#ff906d" },
					{ label: "MálaflokkurC", value: $scope.values[2], color: "#5594ba" },
					{ label: "MálaflokkurD", value: $scope.values[3], color: "#90e662" },
					{ label: "MálaflokkurE", value: $scope.values[4], color: "#ffbd6d" },
					{ label: "MálaflokkurF", value: $scope.values[5], color: "#f16785" },
					{ label: "Annað", 		 value: $scope.values[6], color: "#e6fa6b" },
					{ label: "MálaflokkurA", value: $scope.values[7], color: "#b352bd" }
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
			callbacks: {
				onClickSegment: function(a) {
					console.log("Segment clicked! See the console for all data passed to the click handler.");
					console.log(a);
					$scope.testFunc();
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
	};
	$scope.pie = $scope.reCreate();

	/*
		asdasd
	*/
	$scope.testFunc = function() {
		$http({
			method: 'GET',
			url: 'http://hfpserver.westeurope.cloudapp.azure.com:4000/'
		}).success(function(response) {
			for (var i = 0; i < 8; i++) {
				/* random int between 587.234.610-25.623.456.789*/
				$scope.values[i] = Math.floor((Math.random() * 25623456789) + 587234610);
			}

			if ($scope.totalAmount === "732.027.971") {
				$scope.totalAmount = "274.510.489";
				$scope.dynamic = Math.floor((Math.random() * 100) + 1);
			} else {
				$scope.totalAmount = "732.027.971";
				$scope.dynamic = Math.floor((Math.random() * 100) + 1);
			}

			$scope.pie.destroy();
			$scope.reCreate();

			$scope.testData = response.hits.hits;
			console.log(response);
		}).error(function(err) {
			console.log(err);
		});
	};

	$scope.toggleDrawer = function() {
		$("#wrapper").toggleClass("toggled");
		$("#menu-toggle").toggleClass("glyphicon-remove").toggleClass("glyphicon-filter");
	};

	$scope.toggleCalendar = function() {
		$("#hfp-calendar-dropdown").toggleClass("hfp-hidden");
		$("#calendar-toggle").toggleClass("glyphicon-remove").toggleClass("glyphicon-calendar");
	};

});

hfpApp.controller('tabsController', function ($scope, $http, $window) {
	$scope.oneAtATime = false;

	$scope.groups = [
		{
			status: true,
			title: 'Málaflokkar',
			filters: [
				{ content: 'bla' },
				{ content: 'bla' },
				{ content: 'bla' }
			]
		},
		{
			status: true,
			title: 'Fjárhagslyklar',
			filters: [
				{ content: 'bla' },
				{ content: 'bla' },
				{ content: 'bla' }
			]
		},
		{
			status: true,
			title: 'Lánadrottnar',
			filters: [
				{ content: 'bla' },
				{ content: 'bla' },
				{ content: 'bla' }
			]
		}
	];
});

hfpApp.controller('calendarController', function ($scope) {
	$scope.selectedYear = 2015;
	$scope.selectedMonth = "Janúar";
	$scope.selectedQuarter = "Veitggi";

	$scope.years = [
		2010,
		2011,
		2012,
		2013,
		2014
	];

	$scope.months = [
		"Janúar",
		"Febrúar",
		"Mars",
		"Apríl",
		"Maí",
		"Júní",
		"Júlí",
		"Ágúst",
		"September",
		"Október",
		"Nóvember",
		"Desember"
	];

	$scope.quarters = [
		"wat",
		"bla"
	];

	$scope.setYear = function(year) {
		$scope.selectedYear = year;
	};

	$scope.setMonth = function(month) {
		$scope.selectedMonth = month;
	};

	$scope.setQuarter = function(quarter) {
		$scope.selectedQuarter = quarter;
	};
});