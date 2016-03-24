/**
 * Created by agirmar on 20.3.2016.
 */
hfpApp.controller('chartController', function ($scope, $http, $rootScope, apiURL, colors, chartTextColor) {
    $scope.pie = new d3pie("mypie", {
        data: {
            content: [
                { label: "label", value: 1 }
            ]
        }
    });
    $scope.slices = [];
    $scope.totalCredit = 0;
    $scope.totCredStr = '';
    $scope.totalDebit = 0;
    var totalC = 1;
    $scope.dynamic = $scope.totalCredit / totalC;
    $scope.max = 100;
    $rootScope.level = "expenses/";
    $rootScope.period = "2014-0";
    // TODO: make years function as well

    var toNrWithDots = function (num) {
        var numStr = num.toString();
        var newStr = "";
        var i = numStr.length;
        var j = 1;
        while (i > 0) {
            if (j % 4 === 0) {
                newStr = '.' + newStr;
            } else {
                newStr = numStr[i-1] + newStr;
                i--;
            }
            j++;
        }
        return newStr;
    };

    /*
     TODO: Change this from $rootScope (DANGERZONE) to a Factory/Service.
     */
    $rootScope.testFunc = function() {
        $http({
            method: 'GET',
            url: apiURL + $rootScope.level + $scope.period + '/Affair'
        }).success(function (response) {
            console.log('success');

            $scope.slices      = response.slices;
            $scope.totalCredit = response.totalCredit;
            if ($scope.period.length === 6 && $scope.period.charAt(5) === '0') {
                totalC = $scope.totalCredit;
            }

            $scope.totCredStr  = toNrWithDots($scope.totalCredit);
            $scope.totalDebit  = response.totalDebit;

            $scope.pie.destroy();
            $scope.reCreate();
        }).error(function(err) {
            console.log(err);
        });
    };
    $rootScope.testFunc();

    $scope.reCreate = function() {
        var sliceNumber = 0;

        var newContent = $scope.slices.map(function(slice) {
            var newSlice = {
                label: slice.key,
                value: slice.sum_amount.value,
                color: colors[sliceNumber]
            };
            sliceNumber++;
            sliceNumber %= 8;
            return newSlice;
        });

        console.log(totalC);
        $scope.dynamic = ($scope.totalCredit / totalC * 100).toFixed(1);
        return new d3pie("mypie", {
            header: {
                title: {
                    text: "",
                    color: chartTextColor,
                    font: "font4",
                    fontSize: 24
                },
                location: "pie-center"
            },
            size: {
                canvasWidth: 900,
                canvasHeight: 500
            },
            data: {
                content: newContent
            },
            labels: {
                outer: {
                    format: "label",
                    pieDistance: 50
                },
                inner: {
                    hideWhenLessThanPercentage: 100
                },
                mainLabel: {
                    color: chartTextColor,
                    font: "font1",
                    fontSize: "18"
                },
                value: {
                    color: chartTextColor,
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
                    //enabled: "true",
                    percentage: 99,
                    color: "#1b1b1b"
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
                    console.log("Segment clicked! See the console for all data passed to the click handler.");
                    console.log(a);

                    // Swapping from showing by affairs and primary finance keys for test
                    if ($rootScope.level === "expenses/Affair") {
                        $rootScope.level = "expenses/PrimaryFinanceKey";
                    }
                    else {
                        $rootScope.level = "expenses/Affair";
                    }

                    $rootScope.testFunc($scope.period);
                }
            },
            tooltips: {
                enabled: true,
                type: "placeholder",
                string: "kr. {value} ({percentage}%) ~",
                styles: {
                    color: chartTextColor,
                    font: "font4",
                    fontSize: 14
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
    };

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