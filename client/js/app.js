angular.module('hvertfarapeningarnir', ['ngRoute', 'angular-loading-bar']);

angular.module('hvertfarapeningarnir')
	.controller('testController', ['$scope', '$http', function ($scope, $http) {
		'user strict';

		$scope.testString = "Kópavogsbær";
		$scope.testData = [];

		/*
			asdasd
		*/
		$scope.testFunc = function() {
			$http({
				method: 'GET',
				url: 'http://localhost:4000/'
			}).success(function(response) {
				$scope.testString = response.hits.hits[0]._source.Deild;
				$scope.testData = response.hits.hits;
				console.log(response);
			}).error(function(err) {
				console.log(err);
			});
		}
	}]);