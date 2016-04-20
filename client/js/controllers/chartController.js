/**
 * Created by agirmar on 20.3.2016.
 */
hfpApp.controller('chartController', function ($scope, $http, $rootScope, $routeParams, $route, $location, API_URL, COLORS, CHART_TEXT_COLOR, hfpResource) {
    /*
    *       rootScope variables
    * */

    CanvasJS.addCultureInfo("is", {
            digitGroupSeparator: "."

        });
    $rootScope.chart = new CanvasJS.Chart("miniChartContainer", {
            data: [
                {
                    type: "stackedColumn",
                    axisYType: "primary",
                    dataPoints: [
                        {  y: 0, label: "Út" },
                        {  y: 0, label: "Inn" },
                        {  y: 0, label: "Nettó" }
                    ]
                }
            ],

            backgroundColor: "transparent",
            toolTip: {
                enabled: true,
                animationEnabled: true,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                cornerRadius: 3,
                borderThickness: 0,
                fontColor: CHART_TEXT_COLOR,
                fontStyle: "normal",
                fontFamily: "font4",
                contentFormatter: function(e) {
                    var post = '';
                    if (e.entries[0].dataPoint.label === 'Út') {
                        if (hfpResource.getType() === 'expenses') {
                            post = ' (Kakan)';
                        } else {
                            post = ' (Kostnaðarliðir)';
                        }
                    } else if (e.entries[0].dataPoint.label === 'Inn') {
                        if (hfpResource.getType() === 'expenses') {
                            post = '<br>(Sértekjur, leiðréttingar og millifærslur)';
                        } else {
                            post = ' (Kakan)';
                        }
                    } else {
                        post = ' (Mismunur)';
                    }
                    return "kr. " + hfpResource.toNrWithDots(e.entries[0].dataPoint.y) + post;
                }
            },
            culture: "is",
            axisY: {
                gridThickness: 0.5,
                labelFontSize: 12,
                labelFormatter: function(e) {
                    if (e.value === 0) {
                        return e.value;
                    } else {
                        return "";
                    }
                },
                lineThickness: 0,
                tickThickness: 0
            },
            axisX: {
                labelFontSize: 14,
                lineThickness: 0,
                tickThickness: 0
            },
            animationEnabled: true
        });

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
    $rootScope.breadcrumb = '';

    /*
    *       scope variables
    * */
    $scope.max = 100;

    // If there are any route params we should parse them
    //console.log(Object.keys($routeParams).length);
    hfpResource.parseRouteParams($location.path().split('/'));
    hfpResource.showMeTheMoney(true).then(function() {
        //console.log("Initial data fetched");
    });

    /*
    *       Resets the app to it's initial state
    * */
    $scope.resetApp = function() {
        hfpResource.resetApp();
    };

    $scope.drawerToggled = false;
    $scope.toggleDrawer = function() {
        $("#wrapper").toggleClass("toggled");
        $("#menu-toggle").toggleClass("glyphicon-remove").toggleClass("glyphicon-filter");
        $scope.drawerToggled = !$scope.drawerToggled;
    };

    $scope.toggleCalendar = function() {
        $("#hfp-calendar-dropdown").toggleClass("hfp-hidden");
        $("#calendar-toggle").toggleClass("glyphicon-remove").toggleClass("glyphicon-calendar");
    };

    $rootScope.toggleInstructions = function () {
        if (!$scope.drawerToggled) {
            $scope.toggleDrawer();
        }
        $("#hfp-instructions").toggleClass("hfp-hidden");
        $("#instructions-toggle").toggleClass("glyphicon-remove").toggleClass("glyphicon-question-sign");
    };

    $scope.slices = [];
    $scope.divider = 0;
    $scope.netto = 0;
    $scope.nettoPerc = 0;
    $scope.type = '';
    $rootScope.pieView = true;

    /*
    *   Changes the view from pie to table or table to pie. 
    */
    $rootScope.changeView = function () {
        $rootScope.pieView = !$rootScope.pieView;
        $("#mypie").toggleClass("hfp-hidden");
        $("#table").toggleClass("hfp-hidden");
    };
    
    /*
    *   Updates the table view. 
    */
    $rootScope.updateTable = function () {
        $scope.slices = hfpResource.getSlices();
        $scope.type = hfpResource.getType();
        var net;
        if ($scope.type === 'expenses') {
            $scope.divider = hfpResource.getTotalCredit();
            net = hfpResource.toNr($scope.divider) - hfpResource.getTotalDebit();
            $scope.netto = hfpResource.toNrWithDots(net);
            $scope.nettoPerc = (net / hfpResource.toNr($scope.divider) * 100).toFixed(1);
        } else {
            $scope.divider = hfpResource.getTotalDebit();
            net = hfpResource.toNr($scope.divider) - hfpResource.getTotalCredit();
            console.log(net);
            $scope.netto = hfpResource.toNrWithDots(net);
            $scope.nettoPerc = (net / hfpResource.toNr($scope.divider) * 100).toFixed(1);
        }
        $scope.slices.map(function(slice) {
            slice.percentage = (slice.value / hfpResource.toNr($scope.divider) * 100).toFixed(1);
            slice.value = hfpResource.toNrWithDots(slice.value);
        });
        $scope.level = hfpResource.getLevel();
    };
});
