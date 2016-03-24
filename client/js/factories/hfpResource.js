/**
 * Created by agirmar on 24.3.2016.
 */
hfpApp.factory('hfpResource', function($http, $q, INITIAL_VALUES, API_URL, COLORS, CHART_TEXT_COLOR, $rootScope) {

    // Create empty factory
    var factory = {};

    /*
    *       Private properties
    * */
    var level = INITIAL_VALUES.LEVEL;
    var type = INITIAL_VALUES.TYPE;
    var period = INITIAL_VALUES.PERIOD;

    var slices = [];
    var totalCredit = 0;
    var totalDebit = 0;
    var totalC = 1;
    var dynamic = 100;

    /*
    *       Getters
    * */
    factory.getLevel = function() {
        return level;
    };
    factory.getType = function() {
        return type;
    };
    factory.getPeriod = function() {
        return period;
    };
    factory.getSlices = function() {
        return slices;
    };
    factory.getTotalCredit = function() {
        return totalCredit;
    };
    factory.getTotalDebit = function() {
        return totalDebit;
    };
    factory.getTotalC = function() {
        return totalC;
    };
    factory.getDynamic = function() {
        return dynamic;
    };

    /*
    *       Setters
    * */
    factory.setLevel = function(newLevel) {
        level = newLevel;
    };
    factory.setType = function(newType) {
        type = newType;
    };
    factory.setPeriod = function(newPeriod) {
        period = newPeriod;
    };
    factory.setSlices = function(newSlices) {
        slices = newSlices;
    };
    factory.setTotalCredit = function(newTotalCredit) {
        totalCredit = newTotalCredit;
    };
    factory.setTotalDebit = function(newTotalDebit) {
        totalDebit = newTotalDebit;
    };
    factory.setTotalC = function(newTotalC) {
        totalC = newTotalC;
    };
    factory.setDynamic = function(newDynamic) {
        dynamic = newDynamic;
    };

    /*
    *       Public methods
    * */

    /*
    *       Method that takes the current state of the app (filters and variables), fetches the appropriate data
    *       and recreates that charts to show the newly fetched data.
    * */
    factory.showMeTheMoney = function() {
        var deferred = $q.defer();

        $http({
            // Fetch the data
            method: 'GET',
            url: API_URL + this.getPeriod() + '/' + this.getType() + '/' + this.getLevel()
        }).success(function (response) {
            // Change the slices
            var sliceNumber = 0;
            factory.setSlices(response.slices.map(function(slice) {
                var newSlice = {
                    label: slice.key,
                    value: slice.sum_amount.value,
                    color: COLORS[sliceNumber]
                };
                sliceNumber++;
                sliceNumber %= 8;
                return newSlice;
            }));

            // Change the total amounts
            factory.setTotalCredit(response.totalCredit);
            factory.setTotalDebit(response.totalDebit);

            // Check if totalYearAmount should be changed
            if (factory.getPeriod().length === 6 && factory.getPeriod().charAt(5) === '0') {
                factory.setTotalC(factory.getTotalCredit());
            }

            // Change the percentage number
            factory.setDynamic((factory.getTotalCredit() / factory.getTotalC() * 100).toFixed(1));

            // Change total credit to have dots every the digits
            factory.setTotalCredit(toNrWithDots(factory.getTotalCredit()));

            // Update the root variables
            changeRootVariables();

            deferred.resolve();

        }).error(function(err) {
            console.log(err);
        });

        return deferred.promise;
    };

    /*
    *       Private methods
    * */

    /*
    *       Method that takes a number and returns the same number as a string with a dot inserted every three digits.
    *       Example: toNrWithDots(123456) = 123.456
    * */
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
    *       Method called once new data has been fetched. It updates the $rootScope variables
    * */
    var changeRootVariables = function() {
        $rootScope.totalCredit = factory.getTotalCredit();
        $rootScope.totalDebit = factory.getTotalDebit();
        $rootScope.dynamic = factory.getDynamic();
        $rootScope.pie.destroy();
        $rootScope.pie = new d3pie("mypie", {
            header: {
                title: {
                    text: "",
                    color: CHART_TEXT_COLOR,
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
                content: factory.getSlices()
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
                    color: CHART_TEXT_COLOR,
                    font: "font1",
                    fontSize: "18"
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
                    if (factory.getLevel() === "Affair") {
                        factory.setLevel("PrimaryFinanceKey");
                    }
                    else {
                        factory.setLevel("Affair");
                    }

                    factory.showMeTheMoney();

                }
            },
            tooltips: {
                enabled: true,
                type: "placeholder",
                string: "kr. {value} ({percentage}%) ~",
                styles: {
                    color: CHART_TEXT_COLOR,
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

    return factory;

});