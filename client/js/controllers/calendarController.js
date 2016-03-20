/**
 * Created by agirmar on 20.3.2016.
 */
hfpApp.controller('calendarController', function ($scope, $rootScope, years, months, quarters) {
    $scope.years = years;
    $scope.months = months;
    $scope.quarters = quarters;
    $scope.selectedYear = years[4];
    $scope.selectedMonth = months[0];
    $scope.selectedQuarter = quarters[0];

    $scope.setYear = function(year) {
        $scope.selectedYear = year;
    };

    $scope.setMonth = function(i) {
        $scope.selectedMonth = months[i];
        if (i < 10 && i !== 0) {
            $rootScope.period = $scope.selectedYear + '-0' + i;
        } else {
            $rootScope.period = $scope.selectedYear + '-' + i;
        }
        $scope.testFunc();
    };

    $scope.setQuarter = function(quarter) {
        $scope.selectedQuarter = quarter;
    };
});