angular.module('hvertfarapeningarnir', ['ngRoute', 'angular-loading-bar', 'ui.bootstrap']);

angular.module('hvertfarapeningarnir')
	.controller('testController', ['$scope', '$http', function ($scope, $http) {
		'user strict';

		$scope.testString = "Kópavogsbær";
		$scope.testData = [];
		$scope.dynamic = 80;
		$scope.max = 100;

		/*
			asdasd
		*/
		$scope.testFunc = function() {
			$http({
				method: 'GET',
				url: 'http://localhost:4000/'
			}).success(function(response) {
				if ($scope.testString === "Kópavogsbær") {
					$scope.testString = response.hits.hits[0]._source.Deild;
					$scope.dynamic = 30;
				} else {
					$scope.testString = "Kópavogsbær";
					$scope.dynamic = 80;
				}

				$scope.testData = response.hits.hits;
				console.log(response);
			}).error(function(err) {
				console.log(err);
			});
		}

		$scope.toggleDrawer = function() {
			$("#wrapper").toggleClass("toggled");
			$("#menu-toggle").toggleClass("glyphicon-remove").toggleClass("glyphicon-filter");
		}

		$scope.toggleCalendar = function() {
			$("#hfp-calendar-dropdown").toggleClass("hfp-hidden");
			$("#calendar-toggle").toggleClass("glyphicon-remove").toggleClass("glyphicon-calendar");
		}
	}]);