/**
 * Created by agirmar on 7.4.2016.
 */
hfpApp.controller('loginController', function($scope, authenticationResource) {

    $scope.login = function(form) {
        if (form.$valid) {
            authenticationResource.login($scope.user);
        }
    };
});