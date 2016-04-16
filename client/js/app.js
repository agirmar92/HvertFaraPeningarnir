var hfpApp = angular.module('hvertfarapeningarnir',
	['ngRoute', 'angular-loading-bar', 'ui.bootstrap']);


/*
* 		Routing configuration
* */
hfpApp.config(['$routeProvider',
	function ($routeProvider) {

		$routeProvider
			// Configuring optional routing parameters. Type, period and all of the levels.
		// TODO: try to find classier solution
			.when('/admin', {
				templateUrl: 'views/adminLoginView.html'
			})
			.when('/:Type/:Period/:Level/:AffairGroup?/:Affair?/:DepartmentGroup?/:Department?/:FinanceKey?', {
				templateUrl: 'views/chartView.html'
			})
			.when('/:Type/:Period/:Level/:AffairGroup/:Affair/:DepartmentGroup/:Department/:FinanceKey/', {
				templateUrl: 'views/chartView.html'
			})
			.when('/:income/:Period/:Level/:Department/:FinanceKey/', {
				templateUrl: 'views/chartView.html'
			})
			.otherwise( {
				redirectTo: '/expenses/2014-0/0/n/n/n/n/n/'
			});
	}
]);

/*
*		Addition to be able to prevent reload of page when URL changes
* */
hfpApp.run(function ($route, $rootScope, $location, hfpResource) {
	console.log($location.path());
	var original = $location.path;
	$location.path = function (path, reload, callback, option, choice, nextLevel) {
		if (reload === false) {
			var lastRoute = $route.current;
			var un = $rootScope.$on('$locationChangeSuccess', function () {
				$route.current = lastRoute;
				un();

				hfpResource.parseRouteParams($location.path().split('/'));
				hfpResource.showMeTheMoney().then(function() {
					// If there is a callback, then call it once data has been fetched
					if (callback) {
						callback(option, choice, nextLevel);
					}
				});
			});
		}
		return original.apply($location, [path]);
	};
});