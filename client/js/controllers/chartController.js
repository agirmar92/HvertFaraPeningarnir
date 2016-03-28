/**
 * Created by agirmar on 20.3.2016.
 */
hfpApp.controller('chartController', function ($scope, $http, $rootScope, $routeParams, $route, $location, API_URL, COLORS, CHART_TEXT_COLOR, hfpResource) {
    /*
    *       rootScope variables
    * */
    console.log('------------------' + hfpResource.getType());

    CanvasJS.addCultureInfo("is", {
            digitGroupSeparator: "."

        });
    $rootScope.chart = new CanvasJS.Chart("miniChartContainer", {
            data: [
                {
                    type: "stackedColumn",
                    axisYType: "primary",
                    dataPoints: [
                        {  y: 0, label: "Útgjöld" },
                        {  y: 0, label: "Innkoma" },
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
                    var pre = '';
                    if (e.entries[0].dataPoint.label === 'Útgjöld') {
                        if (hfpResource.getType() === 'income') {
                            pre = ' (Gjöld)';
                        } else {
                            pre = ' (Kakan)';
                        }
                    } else if (e.entries[0].dataPoint.label === 'Innkoma') {
                        if (hfpResource.getType() === 'income') {
                            pre = ' (Kakan)';
                        } else {
                            pre = '<br>(Sértekjur, leiðréttingar og millifærslur)';
                        }
                    } else {
                        pre = ' (Mismunur)';
                    }
                    return "kr. " + hfpResource.toNrWithDots(e.entries[0].dataPoint.y) + pre;
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

    /*
    *       scope variables
    * */
    $scope.max = 100;

    // If there are any route params we should parse them
    console.log(Object.keys($routeParams).length);
    hfpResource.parseRouteParams($location.path().split('/'));
    hfpResource.showMeTheMoney().then(function() {
        console.log("Inital data fetched");
    });

    $scope.toggleDrawer = function() {
        $("#wrapper").toggleClass("toggled");
        $("#menu-toggle").toggleClass("glyphicon-remove").toggleClass("glyphicon-filter");
    };

    $scope.toggleCalendar = function() {
        $("#hfp-calendar-dropdown").toggleClass("hfp-hidden");
        $("#calendar-toggle").toggleClass("glyphicon-remove").toggleClass("glyphicon-calendar");
    };
});
