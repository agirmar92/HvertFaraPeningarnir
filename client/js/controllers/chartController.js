/**
 * Created by agirmar on 20.3.2016.
 */
hfpApp.controller('chartController', function ($scope, $http, $rootScope, API_URL, COLORS, CHART_TEXT_COLOR, hfpResource) {
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
                        {  y: 0, label: "Gjöld", color: "#0dad5c" },
                        {  y: 0, label: "Tekjur" },
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
                    return "kr. " + hfpResource.toNrWithDots(e.entries[0].dataPoint.y);
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

    hfpResource.showMeTheMoney().then(function(result) {
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
