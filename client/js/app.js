angular.module('hvertfarapeningarnir', ['ngRoute', 'angular-loading-bar', 'ui.bootstrap', 'chart.js']);

angular.module('hvertfarapeningarnir')
	.controller('testController', ['$scope', '$http', function ($scope, $http) {
		'user strict';

		$scope.totalAmount = "732.027.971";
		$scope.testData = [];
		$scope.dynamic = 80;
		$scope.max = 100;

		/*
			asdasd
		*/
		$scope.testFunc = function() {
			$http({
				method: 'GET',
				url: 'http://hfpserver.westeurope.cloudapp.azure.com:4000/'
			}).success(function(response) {
				if ($scope.totalAmount === "732.027.971") {
					$scope.totalAmount = "274.510.489";
					$scope.dynamic = 30;
				} else {
					$scope.totalAmount = "732.027.971";
					$scope.dynamic = 80;
				}

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

	}]);