angular.module('hvertfarapeningarnir', ['ngRoute', 'angular-loading-bar']);

angular.module('hvertfarapeningarnir')
	.controller('testController', ['$scope', '$http', function ($scope, $http) {
		'user strict';

		$scope.testString = "pruffaaaaa";

		/*
			asdasd
		*/
		$scope.testFunc = function() {
			$http({
				method: 'GET',
				url: 'http://localhost:4000/'
			}).success(function(response) {
				$scope.testString = response.name;
				console.log(response);
			}).error(function(err) {
				console.log(err);
			});
		}
	}]);