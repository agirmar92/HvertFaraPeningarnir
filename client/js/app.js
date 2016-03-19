var hfpApp = angular.module('hvertfarapeningarnir',
	['ngRoute', 'angular-loading-bar', 'ui.bootstrap']);

hfpApp.controller('pieController', function ($scope, $http) {
	'use strict';

	$scope.pie = new d3pie("mypie", {
		data: {
			content: [
				{ label: "label", value: 1 }
			]
		}
	});
	$scope.slices = [];
	$scope.totalCredit = 0;
	$scope.totCredStr = '';
	$scope.totalDebit = 0;
	$scope.dynamic = 100;
	$scope.max = 100;
	$scope.level = "Affair";

	var toNrWithDots = function (num) {
		var numStr = num.toString();
		var newStr = "";
		var i = numStr.length;
		var j = 1;
		while (i > 0) {
			if (j % 4 === 0) {
				newStr = '.' + newStr;
			} else {
				newStr = numStr[i-1] + newStr;
				i--;
			}
			j++;
		}
		return newStr;
	};

	/*
		asdasd
	*/
	$scope.testFunc = function() {
		$http({
			method: 'GET',
			/* Uncomment line below to call local server */
			//url: 'http://localhost:4000/' + $scope.level
			/* Uncomment line below to call azure server */
			url: 'http://hfp.northeurope.cloudapp.azure.com:4000/' + $scope.level
		}).success(function (response) {
			console.log(response);
			$scope.slices      = response.slices;
			$scope.totalCredit = response.totalCredit;
			$scope.totCredStr  = toNrWithDots($scope.totalCredit);
			$scope.totalDebit  = response.totalDebit;

			$scope.pie.destroy();
			$scope.reCreate();
		}).error(function(err) {
			console.log(err);
		});
	};
	$scope.testFunc();

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
				canvasWidth: 900,
				canvasHeight: 500
			},
			data: {
				content: [
					{ label: $scope.slices[0].key, value: $scope.slices[0].sum_amount.value, color: "#0dad5c" },
					{ label: $scope.slices[1].key, value: $scope.slices[1].sum_amount.value, color: "#ff906d" },
					{ label: $scope.slices[2].key, value: $scope.slices[2].sum_amount.value, color: "#5594ba" },
					{ label: $scope.slices[3].key, value: $scope.slices[3].sum_amount.value, color: "#90e662" },
					{ label: $scope.slices[4].key, value: $scope.slices[4].sum_amount.value, color: "#ffbd6d" },
					{ label: $scope.slices[5].key, value: $scope.slices[5].sum_amount.value, color: "#f16785" },
					{ label: $scope.slices[6].key, value: $scope.slices[6].sum_amount.value, color: "#e6fa6b" },
					{ label: $scope.slices[7].key, value: $scope.slices[7].sum_amount.value, color: "#b352bd" }
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

					// Swapping from showing by affairs and primary finance keys for test
					if ($scope.level === "Affair") {
						$scope.level = "PrimaryFinanceKey";
					}
					else {
						$scope.level = "Affair";
					}

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

	$scope.toggleDrawer = function() {
		$("#wrapper").toggleClass("toggled");
		$("#menu-toggle").toggleClass("glyphicon-remove").toggleClass("glyphicon-filter");
	};

	$scope.toggleCalendar = function() {
		$("#hfp-calendar-dropdown").toggleClass("hfp-hidden");
		$("#calendar-toggle").toggleClass("glyphicon-remove").toggleClass("glyphicon-calendar");
	};

	$scope.switchView = function() {
		$("#chartContainer").addClass("zoomOut").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
			$("#chartContainer").removeClass("zoomOut").addClass("zoomIn");
		});

		$("#miniChartContainer").addClass("zoomOut").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
			$("#miniChartContainer").removeClass("zoomOut").addClass("zoomIn");
		});
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

