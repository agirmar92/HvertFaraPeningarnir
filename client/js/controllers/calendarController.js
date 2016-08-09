/**
 * Created by agirmar on 20.3.2016.
 */
hfpApp.controller('calendarController', function ($scope, $rootScope, $location, $route, hfpResource, YEARS, MONTHS, QUARTERS) {
    $scope.years = YEARS;
    $scope.months = MONTHS;
    $scope.quarters = QUARTERS;
    $rootScope.selectedYear = hfpResource.getPeriod().substring(0,4);
    if (hfpResource.getPeriod()[5] === '0' || hfpResource.getPeriod().substring(5).length > 1) {
        $scope.selectedMonth = MONTHS[parseInt(hfpResource.getPeriod().substring(5))];
        $scope.selectedQuarter = QUARTERS[0];
    } else {
        $scope.selectedMonth = MONTHS[0];
        $scope.selectedQuarter = QUARTERS[parseInt(hfpResource.getPeriod().substring(5))];
    }

    // TODO: This is currently unused, check again later, if still unused, dispose me of this garbage!
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
        $rootScope.selectedYear = year;
        var newPeriod = $rootScope.selectedYear + hfpResource.getPeriod().substring(4);

        pathChange(newPeriod);
        //$rootScope.resetPeriod();
    };

    $scope.setMonth = function(i) {
        $scope.selectedQuarter = QUARTERS[0];
        $scope.selectedMonth = MONTHS[i];
        var newPeriod = $rootScope.selectedYear;
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
        var newPeriod = $rootScope.selectedYear;
        for (var i = 0; i < QUARTERS.length; i++) {
            if (quarter === QUARTERS[i]) {
                newPeriod += '-' + i;
                break;
            }
        }

        pathChange(newPeriod);
    };
});