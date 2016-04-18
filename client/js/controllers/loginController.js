/**
 * Created by agirmar on 7.4.2016.
 */
hfpApp.controller('loginController', function($scope/*, auth*/, $location) {
    //$scope.auth = auth;

    $scope.email = "";
    $scope.password = "";

    $scope.login = function(form) {
        if (form.$valid) {
            $location.path('admin');
        }
    };
});