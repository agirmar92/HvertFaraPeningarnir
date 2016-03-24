/**
 * Created by agirmar on 20.3.2016.
 */
hfpApp.controller('chartController', function ($scope, $http, $rootScope, API_URL, COLORS, CHART_TEXT_COLOR, hfpResource) {
    /*
    *       rootScope variables
    * */
    $rootScope.pie = new d3pie("mypie", {
        data: {
            content: [
                { label: "label", value: 1 }
            ]
        }
    });
    $rootScope.totalCredit = '';
    $rootScope.totalDebit = 0;
    $rootScope.dynamic = 100;

    /*
    *       scope variables
    * */
    $scope.max = 100;

    hfpResource.showMeTheMoney().then(function(result) {
        console.log("Done");
        console.log($rootScope.totalCredit);
        console.log($rootScope.totalDebit);
        console.log($rootScope.dynamic);
    });

    $scope.toggleDrawer = function() {
        $("#wrapper").toggleClass("toggled");
        $("#menu-toggle").toggleClass("glyphicon-remove").toggleClass("glyphicon-filter");
    };

    $scope.toggleCalendar = function() {
        $("#hfp-calendar-dropdown").toggleClass("hfp-hidden");
        $("#calendar-toggle").toggleClass("glyphicon-remove").toggleClass("glyphicon-calendar");
    };

    $scope.switchView = function() {
        $("#chartContainer").addClass("zoomOut").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $("#chartContainer").removeClass("zoomOut").addClass("zoomIn");
        });

        $("#miniChartContainer").addClass("zoomOut").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $("#miniChartContainer").removeClass("zoomOut").addClass("zoomIn");
        });
    };
});