/**
 * Created by agirmar on 7.4.2016.
 */
hfpApp.controller('loginController', function($scope/*, auth*/) {
    //$scope.auth = auth;

    $scope.email = "";
    $scope.password = "";

    $scope.test = function() {
        //console.log("email: " + $scope.email + "\nPassword: " + $scope.password);
    };
});