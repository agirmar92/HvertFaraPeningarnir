/**
 * Created by agirmar on 7.4.2016.
 */
hfpApp.controller('loginController', function($scope, $rootScope, authenticationResource) {

    $rootScope.loggingIn = false;

    $scope.login = function(form) {
        if (form.$valid) {
            $rootScope.loggingIn = true;
            authenticationResource.login($scope.user);
        }
    };
});