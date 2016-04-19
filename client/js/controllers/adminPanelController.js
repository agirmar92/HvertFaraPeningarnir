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
                    from: updateObj.selectedMonthFrom,
                    to: updateObj.selectedMonthTo,
                    token: authenticationResource.getToken(),
                    email: authenticationResource.getEmail(),
                    updateAll: updateObj.updateAllData
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

hfpApp.controller('modalInstanceController', function ($scope, $uibModalInstance, items, YEARS, MONTHS) {

    $scope.years = YEARS;
    $scope.months = MONTHS;
    // Cutting "Veldu" out of the array
    $scope.months.splice(0, 1);

    $scope.updateObject = {
        selectedYearFrom: "Ár",
        selectedYearTo: "Ár",
        selectedMonthFrom: "Mánuður",
        selectedMonthTo: "Mánuður",
        updateAllData: false
    };

    $scope.ok = function () {
        /*
        *       TODO: Validate the updateObject before returning it
        * */
        if ($scope.updateObject.selectedYearFrom !== "Ár" && $scope.updateObject.selectedYearFrom <= $scope.updateObject.selectedYearTo || $scope.updateObject.updateAllData) {
            $uibModalInstance.close($scope.updateObject);
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.selectYearFrom = function(year) {
        $scope.updateObject.selectedYearFrom = year;
        // Set the year TO as well if it hasn't been set to anything before
        if ($scope.updateObject.selectedYearTo === 'Ár') {
            $scope.updateObject.selectedYearTo = year;
        }
    };

    $scope.selectYearTo = function(year) {
        $scope.updateObject.selectedYearTo = year;
    };

    $scope.selectMonthFrom = function(month) {
        $scope.updateObject.selectedMonthFrom = month;
    };

    $scope.selectMonthTo = function(month) {
        $scope.updateObject.selectedMonthTo = month;
    };
});