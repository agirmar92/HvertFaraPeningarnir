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
        $scope.testFunc();
    };

    $scope.setMonth = function(i) {
        $scope.selectedQuarter = QUARTERS[0];
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
        $scope.selectedMonth = MONTHS[0];
        if (quarter === 'Veldu') {
            hfpResource.setPeriod($scope.selectedYear + '-0');
        } else if (quarter === 'Fyrsti') {
            hfpResource.setPeriod($scope.selectedYear + '-1');
        } else if (quarter === 'Annar') {
            hfpResource.setPeriod($scope.selectedYear + '-2');
        } else if (quarter === 'Þriðji') {
            hfpResource.setPeriod($scope.selectedYear + '-3');
        } else if (quarter === 'Fjórði') {
            hfpResource.setPeriod($scope.selectedYear + '-4');
        }
        hfpResource.showMeTheMoney();
    };
});