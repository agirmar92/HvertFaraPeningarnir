/**
 * Created by agirmar on 20.3.2016.
 */
hfpApp.controller('chartController', function ($scope, $http, $rootScope, $routeParams, $route, $location, API_URL, COLORS, CHART_TEXT_COLOR, hfpResource, $uibModal) {

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
                backgroundColor: "rgba(232, 232, 232, 0.9)",
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
                            post = ' (Sértekjur)';
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
                tickThickness: 0,
                labelFontFamily: "font4"
            },
            axisX: {
                labelFontSize: 16,
                lineThickness: 0,
                tickThickness: 0,
                labelFontColor: CHART_TEXT_COLOR,
                labelFontFamily: "font4"
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
    $scope.dataReady = false;
    $scope.toOrderBy = '';
    $scope.orderReverse = false;
    $scope.drawerToggled = false;
    $scope.infoShow = false;


    // If there are any route params we should parse them
    hfpResource.parseRouteParams($location.path().split('/'));
    hfpResource.showMeTheMoney(true).then(function() {
        $scope.dataReady = true;
    });

    /*
    *       Resets the app to it's initial state
    * */
    $scope.resetApp = function() {
        hfpResource.resetApp();
    };

    $scope.orderBy = function(newOrderBy) {
        if (newOrderBy === $scope.toOrderBy) {
            // If we should reverse the order
            $scope.orderReverse = !$scope.orderReverse;
        } else {
            // Else switch the order by
            $scope.toOrderBy = newOrderBy;
        }
    };

    $scope.toggleInfo = function() {
        $scope.infoShow = !$scope.infoShow;
    }

    $scope.toggleDrawer = function() {
        $("#sidebar-wrapper").toggleClass("toggle-sidebar");
        $("#menu-toggle").toggleClass("glyphicon-remove").toggleClass("glyphicon-menu-hamburger");
        $scope.drawerToggled = !$scope.drawerToggled;
    };

    $scope.toggleCalendar = function() {
        $("#hfp-calendar-dropdown").toggleClass("hfp-hidden");
        $("#calendar-toggle").toggleClass("glyphicon-remove").toggleClass("glyphicon-time");
    };

    $rootScope.toggleInstructions = function () {
        if (!$scope.drawerToggled) {
            $scope.toggleDrawer();
        }
        $("#hfp-instructions").toggleClass("hfp-hidden");
        $("#instructions-close").toggleClass("hfp-hidden").toggleClass("bring-to-front");
        $("#instructions-toggle").toggleClass("hfp-hidden");
    };
    
    $scope.toggleHelp = function() {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'helpModalContent.html',
            controller: 'helpModalInstanceController',
            size: 'sm'
        });
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
        $("#miniChartContainer").toggleClass("hfp-hidden");
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
            $scope.extraDimLabel = "Sértekjur";
            $scope.extraDim = hfpResource.toNrWithDots(hfpResource.getTotalDebit());
            $scope.extraDimPerc = (hfpResource.getTotalDebit() / hfpResource.toNr($scope.divider) * 100).toFixed(1);
        } else {
            $scope.divider = hfpResource.getTotalDebit();
            net = hfpResource.toNr($scope.divider) - hfpResource.getTotalCredit();
            $scope.netto = hfpResource.toNrWithDots(net);
            $scope.nettoPerc = (net / hfpResource.toNr($scope.divider) * 100).toFixed(1);
            $scope.extraDimLabel = "Kostnaðarliðir";
            $scope.extraDim = hfpResource.toNrWithDots(hfpResource.getTotalCredit());
            $scope.extraDimPerc = (hfpResource.getTotalCredit() / hfpResource.toNr($scope.divider) * 100).toFixed(1);
        }
        $scope.slices.map(function(slice) {
            slice.percentage = (slice.value / hfpResource.toNr($scope.divider) * 100).toFixed(1);
            slice.value = hfpResource.toNrWithDots(slice.value);
            slice.key = parseInt(slice.key);
        });
        $scope.level = hfpResource.getLevel();
    };

    /*
     *       Callback function overwrite for when screen size is modified.
     *       Calculates the new size of the chart and bar chart and redraws them.
     * */
    $(window).resize(function() {
        // Set height and width variables appropriately to the changes
        hfpResource.setPieHeight($('#hfpPie').height());
        hfpResource.setPieWidth($('#hfpPie').width());
        hfpResource.setPieRadius(Math.min($('#hfpPie').width() * 0.2, $('#hfpPie').height() * 0.25));

        // Modify the chart's settings and redraw
        $rootScope.pie.options.size.canvasWidth = hfpResource.getPieWidth();
        $rootScope.pie.options.size.canvasHeight = hfpResource.getPieHeight();
        $rootScope.pie.options.size.pieOuterRadius = hfpResource.getPieRadius();
        $rootScope.pie.options.labels.mainLabel.fontSize = Math.max(12, hfpResource.getPieRadius() * 0.125);
        $rootScope.pie.options.labels.outer.pieDistance = Math.min((hfpResource.getPieWidth() / 350) * 10, 50);
        $rootScope.pie.redraw();

        // Modify the bar chart's settings and redraw
        var miniChartWidth = $('#miniChartContainer').width();
        $('#miniChartContainer').css({'height': miniChartWidth + 'px'});
    });
});


hfpApp.controller('helpModalInstanceController', function ($scope, $uibModalInstance) {

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
