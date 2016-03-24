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
        $scope.testFunc();
    };

    $scope.setMonth = function(i) {
        $scope.selectedMonth = months[i];
        $scope.selectedQuarter = quarters[0];
        $rootScope.period = (i < 10 && i !== 0) ? 
            $scope.selectedYear + '-0' + i : 
            $rootScope.period = $scope.selectedYear + '-' + i;
        $scope.testFunc();
    };

    $scope.setQuarter = function(quarter) {
        $scope.selectedQuarter = quarter;
        $scope.selectedMonth = months[0];
        if (quarter === 'Veldu') {
            $rootScope.period = $scope.selectedYear + '-0';
        } else if (quarter === 'Fyrsti') {
            $rootScope.period = $scope.selectedYear + '-1';
        } else if (quarter === 'Annar') {
            $rootScope.period = $scope.selectedYear + '-2';
        } else if (quarter === 'Þriðji') {
            $rootScope.period = $scope.selectedYear + '-3';
        } else if (quarter === 'Fjórði') {
            $rootScope.period = $scope.selectedYear + '-4';
        }
        $scope.testFunc();
    };
});