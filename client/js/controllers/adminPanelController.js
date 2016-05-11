hfpApp.controller('adminPanelController', function ($scope, $uibModal, $log, $http, $location, API_URL, authenticationResource, $rootScope) {

    $scope.open = function (size) {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'myModalContent.html',
            controller: 'modalInstanceController',
            size: size,
            resolve: {
                items: function () {
                    return $scope.items;
                }
            }
        });

        modalInstance.result.then(function (updateObj) {
            $http({
                // Fetch the data
                method: 'POST',
                url: API_URL + 'updateDatabase',
                data: {
                    year: updateObj.selectedYear,
                    token: authenticationResource.getToken(),
                    email: authenticationResource.getEmail()
                }
            }).success(function (response) {
                console.log(response);
                // Show success alert
                $rootScope.alerts.push({
                    type: 'success',
                    msg: 'Uppfærsla hefur verið sett af stað. Ferlið getur tekið nokkrar mínútur. Kerfið sendir þér tölvupóst að ferli loknu.'
                });
            }).error(function(err) {
                console.log(err);
                // Show error alert
                $rootScope.alerts.push({
                    type: 'danger',
                    msg: 'Eitthvað fór úrskeiðis'
                });
            });
            console.log(updateObj);

        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.logout = function() {
        authenticationResource.logout();
    };

});

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.
hfpApp.controller('modalInstanceController', function ($scope, $uibModalInstance, items, YEARS) {

    $scope.years = YEARS;

    $scope.updateObject = {
        selectedYear: "Ár"
    };

    $scope.ok = function () {
        if ($scope.updateObject.selectedYear !== "Ár") {
            $uibModalInstance.close($scope.updateObject);
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.selectYear = function(year) {
        $scope.updateObject.selectedYear = year;
    };
});