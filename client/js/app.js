var hfpApp = angular.module('hvertfarapeningarnir', [
  'ngRoute',
  'angular-loading-bar',
  'ui.bootstrap',
  'firebase',
  'angulartics',
  'angulartics.google.analytics',
  'ngMaterial',
]);

/*
 * 		Routing configuration
 * */
hfpApp.config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider
      // Configuring optional routing parameters. Type, period and all of the levels.
      .when('/login', {
        templateUrl: 'views/adminLoginView.html',
      })
      .when('/admin', {
        templateUrl: 'views/adminPanelView.html',
        controller: 'adminPanelController',
        resolve: {
          currentAuth: function (authenticationResource) {
            return authenticationResource.requireAuth();
          },
        },
      })
      .when('/:Type/:Period/:Level/:Department/:FinanceKey/:Creditor', {
        templateUrl: 'views/chartView.html',
      })
      .when(
        '/:Type/:Period/:Level/:AffairGroup/:Affair/:DepartmentGroup/:Department/:FinanceKey/:Creditor',
        {
          templateUrl: 'views/chartView.html',
        }
      )
      .otherwise({
        redirectTo: '/expenses/2021-0/0/n/n/n/n/n/n/',
      });
  },
]);

/*
 *		Addition to be able to prevent reload of page when URL changes
 * */
hfpApp.run(function ($route, $rootScope, $location, $analytics, hfpResource, $window) {
  var original = $location.path;
  $location.path = function (
    path,
    reload,
    callback,
    option,
    choice,
    nextLevel,
    isUnchoosingCreditor
  ) {
    if (reload === false) {
      // Flag to make sure we don't call this function twice.
      $rootScope.beenCalled = true;
      var lastRoute = $route.current;
      var un = $rootScope.$on('$locationChangeSuccess', function () {
        // Send Google analytics info
        $window.ga('send', 'pageview', { page: $location.url() });
        $analytics.pageTrack($location.path());

        $route.current = lastRoute;
        un();

        // If we are going to level 7 from any other level AND there is a creditor selected there.
        var to7fromAnyOtherWithSelectedCreditor =
          nextLevel === 7 && $rootScope.options[7].currChoice !== -1 && option !== 7;
        hfpResource.parseRouteParams($location.path().split('/'));
        hfpResource.showMeTheMoney(false, to7fromAnyOtherWithSelectedCreditor).then(function () {
          // If there is a callback, then call it once data has been fetched
          if (callback) {
            callback(option, choice, nextLevel, isUnchoosingCreditor);
          }
        });
      });
    }
    return original.apply($location, [path]);
  };
});
