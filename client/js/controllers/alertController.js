/**
 * Created by Darri on 4/19/16.
 */
hfpApp.controller('alertController', function($rootScope, $scope) {
    $rootScope.alerts = [];
    $scope.closeAlert = function(index) {
        $rootScope.alerts.splice(index, 1);
    };
});