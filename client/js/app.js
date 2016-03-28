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
				templateUrl: 'views/chartView.html',
				controller: 'chartController'
			})
			.when('/:Type/:Period/:Level/:AffairGroup?/:Affair/:DepartmentGroup/:Department/:FinanceKey/', {
				templateUrl: 'views/chartView.html',
				controller: 'chartController'
			})
			.when('/:income/:Period/:Level/:Department/:FinanceKey/', {
				templateUrl: 'views/chartView.html',
				controller: 'chartController'
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
	console.log('inside run');
	var original = $location.path;
	$location.path = function (path, reload, field, id) {
		if (reload === false) {
			var lastRoute = $route.current;
			var un = $rootScope.$on('$locationChangeSuccess', function () {
				$route.current = lastRoute;
				un();

				console.log(field + ": " + id);
				//hfpResource[field](id);
				hfpResource.parseRouteParams($location.path().split('/'));
				hfpResource.showMeTheMoney();
			});
		}
		return original.apply($location, [path]);
	};
});