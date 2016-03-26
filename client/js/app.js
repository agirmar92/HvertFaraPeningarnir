var hfpApp = angular.module('hvertfarapeningarnir',
	['ngRoute', 'angular-loading-bar', 'ui.bootstrap']);


/*
* 		Routing configuration
* */
hfpApp.config(['$routeProvider',
	function ($routeProvider) {

		$routeProvider
			/*
			* 		Configuring optional routing parameters. Type, period and all of the levels.
			* */
			.when('/:type?/:period?/:affairGroup?/:affair?/:departmentGroup?/:department?/:pfk?/:sfk?/:fk?', {
				templateUrl: 'views/chartView.html'
			})
			.when('/admin', {
				templateUrl: 'views/adminLoginView.html'
			})
			.otherwise( {
				redirectTo: '/'
			});
	}
]);