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
    };

    $scope.toggleDrawer = function() {
        $("#sidebar-wrapper").toggleClass("toggle-sidebar");
        $(".menu-toggle").toggleClass("glyphicon-remove").toggleClass("glyphicon-menu-hamburger");
        $scope.drawerToggled = !$scope.drawerToggled;
    };

    $scope.toggleCalendar = function() {
        $("#hfp-calendar-dropdown").toggleClass("hfp-hidden");
        $(".calendar-toggle").toggleClass("glyphicon-remove").toggleClass("glyphicon-time");
    };

    /*
    *       When a list item is clicked inside the table view, drill down just as if a slice was clicked.
    * */
    $scope.listItemClicked = function(listItem) {
        // If the listItem has a string representive of the key, replace the int version with the string.
        if (listItem.data.keyString) {
            listItem.data.key = listItem.data.keyString;
            delete listItem.data['keyString'];
        }
        hfpResource.sliceClicked(listItem);
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

    $rootScope.isMobile = function() {
        return ($(window).width() < 765);
    };
    $rootScope.pieView = true;

    /*
    *   Changes the view from pie to table or table to pie.
    */
    $rootScope.changeView = function () {
        $rootScope.pieView = !$rootScope.pieView;
        hfpResource.showMeTheMoney(false, false).then(function() {
            $("#chartContainer").toggleClass("hfp-hidden");
            $("#miniChartContainer").toggleClass("hfp-hidden");
            $("#table").toggleClass("hfp-hidden");
            $("#tableContainer").toggleClass("hfp-hidden");
        });
        redrawPie();
    };

    /*
    *   Updates the bar chart
    */
    $rootScope.updateBarChart = function() {
        // Recreate the bar chart with a nice animation to hide the ugly transition
        $("#miniChartContainer").addClass("zoomOut").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $("#miniChartContainer").removeClass("zoomOut").addClass("zoomIn");
        });
        setTimeout(function() {
            $rootScope.chart.render();
        }, 500);
    }

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
            if (hfpResource.getLevel() !== 3 && hfpResource.getLevel() !== 7) {
                // Preserve the key as a string as well.
                slice.keyString = slice.key;
                slice.key = parseInt(slice.key);
            }
        });
        $scope.level = hfpResource.getLevel();
    };

    /*
    *   Updates the pie view
    */
    $rootScope.updatePie = function() {
        $rootScope.pie.destroy();
        $rootScope.pie = new d3pie("mypie", {
            "header": {
                "title": {
                    "text": hfpResource.translate() + ", " + hfpResource.tDate(),
                    "fontSize": 26,
                    "font": "font4",
                    "color": "#444e52"
                },
                "subtitle": {
                    "text": hfpResource.getPathLabels(),
                    "color": "#999999",
                    "fontSize": 14,
                    "font": "font4"
                },
                "titleSubtitlePadding": 10
            },
            size: {
                canvasWidth: hfpResource.getPieWidth(),       //900,
                canvasHeight: hfpResource.getPieHeight(),     //500
                pieOuterRadius: hfpResource.getPieRadius()
            },
            data: {
                content: hfpResource.getSlices()
            },
            labels: {
                outer: {
                    format: "label",
                    pieDistance: Math.min((hfpResource.getPieWidth() / 350) * 10, 50)
                },
                inner: {
                    hideWhenLessThanPercentage: 100
                },
                mainLabel: {
                    color: CHART_TEXT_COLOR,
                    font: "font4",
                    fontSize: Math.min(20, Math.max(10, hfpResource.getPieRadius() * 0.1))
                },
                value: {
                    color: CHART_TEXT_COLOR,
                    font: "font4",
                    fontSize: "12"
                },
                lines: {
                    style: "straight"
                }
            },
            misc: {
                colors: {
                    segmentStroke: "null"
                },
                gradient: {
                    percentage: 99,
                    color: "#1b1b1b"
                },
                "canvasPadding": {
                    "top": 20
                },
                "pieCenterOffset": {
                    "y": -20
                }
            },
            effects: {
                load: {
                    speed: 800
                },
                pullOutSegmentOnClick: {
                    effect: "none"
                }
            },
            callbacks: {
                onClickSegment: function(a) {
                    hfpResource.sliceClicked(a);
                },
                onMouseoverSegment: function(a) {
                    // JQuery's 'attribute ends with' selector (for IE tooltip bug). Don't try this at home kids.
                    $("g[id$='_tooltip" + a.index + "']").show();
                },
                onMouseoutSegment: function(a) {
                    $("g[id$='_tooltip" + a.index + "']").hide();
                }
            },
            tooltips: {
                enabled: true,
                type: "placeholder",
                string: "kr. {value} ({percentage}%) ~",
                styles: {
                    color: CHART_TEXT_COLOR,
                    font: "font4",
                    fontSize: 14,
                    opacity: 1,
                    backgroundColor: '#e8e8e8',
                    backgroundOpacity: '0.9',
                    padding: 8
                },
                placeholderParser: function(index, data) {
                    var valueStr = data.value.toString();
                    data.value = "";
                    var i = valueStr.length;
                    var j = 1;
                    while (i > 0) {
                        if (j % 4 === 0) {
                            data.value = '.' + data.value;
                        } else {
                            data.value = valueStr[i-1] + data.value;
                            i--;
                        }
                        j++;
                    }
                }
            }
        });
    }

    /*
     *       Callback function overwrite for when screen size is modified.
     *       Calculates the new size of the chart and bar chart and redraws them.
     * */
    $(window).resize(function() {
        redrawPie();
    });

    var redrawPie = function() {
        setTimeout(function() {
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
        }, 250);
    }
});


hfpApp.controller('helpModalInstanceController', function ($scope, $uibModalInstance) {

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
