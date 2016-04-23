/**
 * Created by agirmar on 20.3.2016.
 */
hfpApp.controller('calendarController', function ($scope, $rootScope, $location, $route, hfpResource, YEARS, MONTHS, QUARTERS) {
    $scope.years = YEARS;
    $scope.months = MONTHS;
    $scope.quarters = QUARTERS;
    $scope.selectedYear = hfpResource.getPeriod().substring(0,4);
    $scope.selectedMonth = MONTHS[0];
    $scope.selectedQuarter = QUARTERS[0];

    $rootScope.resetPeriod = function() {
        $scope.selectedMonth = MONTHS[0];
        $scope.selectedQuarter = QUARTERS[0];
    };

    var pathChange = function (newPeriod) {
        // Create a new path
        var newPathPrefix = $location.path().split('/');
        newPathPrefix[2] = newPeriod;
        newPathPrefix = hfpResource.replaceAllCommasWithSlashes(newPathPrefix.toString());

        // Change the path
        $location.path(newPathPrefix, false);
    };

    $scope.setYear = function(year) {
        $scope.selectedYear = year;
        var newPeriod = $scope.selectedYear;
        newPeriod += '-0';

        pathChange(newPeriod);
        $rootScope.resetPeriod();
    };

    $scope.setMonth = function(i) {
        $scope.selectedQuarter = QUARTERS[0];
        $scope.selectedMonth = MONTHS[i];
        var newPeriod = $scope.selectedYear;
        if (i < 10 && i !== 0) {
            newPeriod += '-0' + i;
        } else {
            newPeriod += '-' + i;
        }

        pathChange(newPeriod);
    };

    $scope.setQuarter = function(quarter) {
        $scope.selectedQuarter = quarter;
        $scope.selectedMonth = MONTHS[0];
        var newPeriod = $scope.selectedYear;
        for (var i = 0; i < QUARTERS.length; i++) {
            if (quarter === QUARTERS[i]) {
                newPeriod += '-' + i;
                break;
            }
        }

        pathChange(newPeriod);
    };
});