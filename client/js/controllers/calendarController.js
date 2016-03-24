/**
 * Created by agirmar on 20.3.2016.
 */
hfpApp.controller('calendarController', function ($scope, $rootScope, hfpResource, YEARS, MONTHS, QUARTERS) {
    $scope.years = YEARS;
    $scope.months = MONTHS;
    $scope.quarters = QUARTERS;
    $scope.selectedYear = YEARS[4];
    $scope.selectedMonth = MONTHS[0];
    $scope.selectedQuarter = QUARTERS[0];

    $scope.setYear = function(year) {
        $scope.selectedYear = year;
    };

    $scope.setMonth = function(i) {
        $scope.selectedMonth = MONTHS[i];
        if (i < 10 && i !== 0) {
            hfpResource.setPeriod($scope.selectedYear + '-0' + i);
        } else {
            hfpResource.setPeriod($scope.selectedYear + '-' + i);
        }

        hfpResource.showMeTheMoney();
    };

    $scope.setQuarter = function(quarter) {
        $scope.selectedQuarter = quarter;
    };
});