/**
 * Created by agirmar on 20.3.2016.
 */
hfpApp.controller('tabsController', function ($scope, $http, $window, $rootScope) {
    // true = view expenses ; false = view income
    $scope.expenses = true;
    $scope.oneAtATime = false;

    $scope.changeView = function(toExpenses) {
        $scope.expenses = toExpenses;
        $rootScope.level = toExpenses? 'expenses/Affair' : 'income';
        $rootScope.testFunc();
    };

    $scope.groups = [
        {
            status: true,
            title: 'Málaflokkar',
            filters: [
                { content: 'bla' },
                { content: 'bla' },
                { content: 'bla' }
            ]
        },
        {
            status: true,
            title: 'Fjárhagslyklar',
            filters: [
                { content: 'bla' },
                { content: 'bla' },
                { content: 'bla' }
            ]
        },
        {
            status: true,
            title: 'Lánadrottnar',
            filters: [
                { content: 'bla' },
                { content: 'bla' },
                { content: 'bla' }
            ]
        }
    ];
});