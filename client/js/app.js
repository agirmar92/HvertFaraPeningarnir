var hfpApp = angular.module('hvertfarapeningarnir',
	['ngRoute', 'angular-loading-bar', 'ui.bootstrap']);

hfpApp.controller('pieController', function ($scope, $http, $rootScope) {
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
	$rootScope.level = "expenses/Affair";

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
		TODO: Change this from $rootScope (DANGERZONE) to a Factory/Service.
	*/
	$rootScope.testFunc = function() {
		$http({
			method: 'GET',
			/* Uncomment line below to call local server */
			//url: 'http://localhost:4000/' + $rootScope.level
			/* Uncomment line below to call azure server */
			url: 'http://hfp.northeurope.cloudapp.azure.com:4000/' + $rootScope.level
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
	$rootScope.testFunc();

	$scope.reCreate = function() {
		var sliceNumber = 0;
		var colors = [
			"#0dad5c",
			"#ff906d",
			"#5594ba",
			"#90e662",
			"#ffbd6d",
			 "#f16785",
			 "#e6fa6b",
			 "#b352bd"
		];

		var newContent = $scope.slices.map(function(slice) {
			var newSlice = {
				label: slice.key,
				value: slice.sum_amount.value,
				color: colors[sliceNumber]
			};
			sliceNumber++;
			return newSlice;
		});

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
				content: newContent
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
					if ($rootScope.level === "expenses/Affair") {
						$rootScope.level = "expenses/PrimaryFinanceKey";
					}
					else {
						$rootScope.level = "expenses/Affair";
					}

					$rootScope.testFunc();
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

hfpApp.controller('tabsController', function ($scope, $http, $window, $rootScope) {
	$scope.oneAtATime = false;
	// true = view expenses ; false = view income
	$scope.expenses = true;

	$scope.changeView = function(toExpenses) {
		$scope.expenses = toExpenses;
		$rootScope.level = toExpenses? 'expenses/Affair' : 'income';
		$rootScope.testFunc();
	};

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

