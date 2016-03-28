/**
 * Created by agirmar on 24.3.2016.
 */
hfpApp.factory('hfpResource', function($http, $q, $routeParams, $route, $location, INITIAL_VALUES, API_URL, COLORS, CHART_TEXT_COLOR, LEVELS, URL_PARAMS, $rootScope) {

    // Create empty factory
    var factory = {};

    /*
    *       Private properties
    * */
    var currLevelEx = INITIAL_VALUES.LEVEL_EX;
    var currLevelIn = INITIAL_VALUES.LEVEL_IN;
    var type = INITIAL_VALUES.TYPE;
    var period = INITIAL_VALUES.PERIOD;

    var slices = [];
    var totalCredit = 0;
    var totalDebit = 0;
    var totalC = 32321545934;
    var totalD = 18529125975;
    var dynamic = 100;
    var clickedSlice = "";
    var affairGroup = "all";
    var affair = "all";
    var departmentGroup = "all";
    var department = "all";
    var financeKey = "all";

    /*
    *       Getters
    * */
    factory.getLevel = function() {
        if (factory.getType() === 'income') {
            return currLevelIn;
        } else {
            return currLevelEx;
        }
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
    factory.getTotalD = function() {
        return totalD;
    };
    factory.getDynamic = function() {
        return dynamic;
    };
    factory.getClickedSlice = function() {
        return clickedSlice;
    };
    factory.getAffairGroup = function() {
        return affairGroup;
    };
    factory.getAffair = function() {
        return affair;
    };
    factory.getDepartmentGroup = function() {
        return departmentGroup;
    };
    factory.getDepartment = function() {
        return department;
    };
    factory.getFinanceKey = function() {
        return financeKey;
    };

    /*
    *       Setters
    * */
    factory.setLevel = function(newLevel) {
        if (factory.getType() === 'income') {
            currLevelIn = newLevel;
        } else {
            currLevelEx = newLevel;
        }
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
    factory.setTotalD = function(newTotalD) {
        totalD = newTotalD;
    };
    factory.setDynamic = function(newDynamic) {
        dynamic = newDynamic;
    };
    factory.setClickedSlice = function(newclickedSlice) {
        clickedSlice = newclickedSlice;
    };
    factory.setAffairGroup = function(newAffairGroup) {
        affairGroup = newAffairGroup;
    };
    factory.setAffair = function(newAffair) {
        affair = newAffair;
    };
    factory.setDepartmentGroup = function(newDepartmentGroup) {
        departmentGroup = newDepartmentGroup;
    };
    factory.setDepartment = function(newDepartment) {
        department = newDepartment;
    };
    factory.setFinanceKey = function(newFinanceKey) {
        financeKey = newFinanceKey;
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
        var queryURL;
        if (factory.getType() === 'expenses') {
            queryURL = API_URL + this.getType() + '/' + this.getPeriod() + '/' + this.getLevel() + '/' + this.getAffairGroup() + '/' + this.getAffair() + '/' + this.getDepartmentGroup() + '/' + this.getDepartment() + '/' + this.getFinanceKey();
        } else {
            queryURL = API_URL + this.getType() + '/' + this.getPeriod() + '/' + this.getLevel() + '/' + this.getDepartment() + '/' + this.getFinanceKey();
        }
        
        $http({
            // Fetch the data
            method: 'GET',
            //url: API_URL + this.getType() + '/' + this.getPeriod() + '/' + '0' + '/' + this.getAffairGroup() + '/' + this.getAffair() + '/' + this.getDepartmentGroup() + '/' + this.getDepartment() + '/' + '2521'
            url: queryURL
        }).success(function (response) {
            // Change the slices
            var sliceNumber = 0;
            var currLvl = factory.getLevel();
            console.log('currLvl: ' + currLvl);
            factory.setSlices(response.slices.map(function(slice) {
                var cut = 0;
                var newSlice = {};
                if (currLvl === 0) {
                    cut = 1;
                } else if (currLvl === 1) {
                    cut = 2;
                } else if (currLvl === 2) {
                    cut = 3;
                } else if (currLvl === 3) {
                    cut = 6;
                } else if (currLvl > 6) {
                    newSlice = {
                        label: slice.key,
                        value: slice.sum_amount.value,
                        color: COLORS[sliceNumber],
                        key: slice.key
                    };
                } else {
                    cut = 4;
                }
                if (currLvl < 7) {
                    newSlice = {
                        label: slice.key.substring(cut + 1),
                        value: slice.sum_amount.value,
                        color: COLORS[sliceNumber],
                        key: slice.key.substring(0,cut)
                    };
                }
                sliceNumber++;
                sliceNumber %= 8;
                return newSlice;
            }));

            // Change the total amounts
            factory.setTotalCredit(response.totalCredit);
            factory.setTotalDebit(response.totalDebit);


            /* Check if totalYearAmount should be changed
            if (factory.getPeriod().substring(0,4) === factory.getPeriod().substring(0,4)) {
                factory.setTotalC(factory.getTotalCredit());
            }*/

            // Updating bar chart data
            $rootScope.chart.options.data[0].dataPoints[0].y = factory.getTotalCredit();
            $rootScope.chart.options.data[0].dataPoints[1].y = factory.getTotalDebit();

            
            if (factory.getType() === 'expenses') {
                $rootScope.chart.options.data[0].dataPoints[2].y = factory.getTotalCredit() - factory.getTotalDebit();
                // Change the percentage number
                factory.setDynamic((factory.getTotalCredit() / factory.getTotalC() * 100).toFixed(1));

                // Change total credit to have dots every the digits
                factory.setTotalCredit(factory.toNrWithDots(factory.getTotalCredit()));
            } else {
                $rootScope.chart.options.data[0].dataPoints[2].y = factory.getTotalDebit() - factory.getTotalCredit();
                // Change the percentage number
                factory.setDynamic((factory.getTotalDebit() / factory.getTotalD() * 100).toFixed(1));

                // Change total debit to have dots every the digits
                factory.setTotalDebit(factory.toNrWithDots(factory.getTotalDebit()));
            }

            

            // Update the root variables
            changeRootVariables();

            deferred.resolve();

        }).error(function(err) {
            console.log(err);
        });

        return deferred.promise;
    };

    /*
     *       Method that takes a number and returns the same number as a string with a dot inserted every three digits.
     *       Example: toNrWithDots(123456) = 123.456
     * */
    factory.toNrWithDots = function(num) {
        var numStr = num.toString();
        var newStr = "";
        var i = numStr.length;
        var j = 1;
        while (i > 0) {
            if (j % 4 === 0 && numStr[i-1] !== '-') {
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
    *       Goes through the route parameters and sets the inital state of the app
    * */
    factory.parseRouteParams = function(params) {
        //var deferred = $q.defer();

        console.log("parsing");

        //var paramCounter = -3;
        for (var param in params) {
            var typ = factory.getType();
            var value = params[param];
            param = URL_PARAMS[typ][parseInt(param)-1];
            if (param === undefined) {
                continue;
            }
            if (value === 'n') {
                value = 'all';
            } else if (param === 'Level') {
                value = parseInt(value);
            }
            console.log(param + ": " + value);
            factory['set' + param](value);
            //paramCounter++;

        }
        //factory.setLevel($routeParams['Level']);

        /*// Set others to default
        while (paramCounter < 5) {
            var funcName = 'set' + LEVELS[paramCounter];
            if (paramCounter === 4) {
                funcName = 'setFinanceKey';
            }
            console.log(funcName + '(\'all\')');
            factory[funcName]('all');
            paramCounter++;
        }*/
    };

    /*
    *       Private methods
    * */

    /*
    *       Method called once new data has been fetched. It updates the $rootScope variables
    * */
    var changeRootVariables = function() {
        // Sums
        $rootScope.totalCredit = factory.getTotalCredit();
        $rootScope.totalDebit = factory.getTotalDebit();
        $rootScope.dynamic = factory.getDynamic();

        // Recreate the bar chart with a nice animation to hide the ugly transition
        $("#miniChartContainer").addClass("zoomOut").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $("#miniChartContainer").removeClass("zoomOut").addClass("zoomIn");
        });
        setTimeout(function() {
            $rootScope.chart.render();
        }, 500);

        // Recreate the pie chart
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
                    factory.setClickedSlice(a.data.key);
                    var id = a.data.key;
                    var field = "set";
                    var key;
                    var lvl = factory.getLevel();
                    console.log("lvl: " + lvl);
                    if (parseInt(lvl) === 0) {
                        //factory.setAffairGroup(id);
                        field += 'AffairGroup';
                        key = 0;
                    } else if (lvl === 1) {
                        //factory.setAffair(id);
                        field += 'Affair';
                        key = 1;
                    } else if (lvl === 2) {
                        //factory.setDepartmentGroup(id);
                        field += 'DepartmentGroup';
                        key = 2;
                    } else if (lvl === 3) {
                        //factory.setDepartment(id);
                        field += 'Department';
                        key = 3;
                    } else if (lvl > 3 && lvl < 7) {
                        //factory.setFinanceKey(id);
                        field += 'FinanceKey';
                        key = 4;
                    } else if (lvl === 7) {
                        console.log('Þú ert kominn niður á botninn.');
                    }
                    if (lvl < 7) {
                        //factory.setLevel(factory.getLevel() + 1);

                        // Create a new path with a incremented level
                        var newPathPrefix = $location.path().split('/');
                        var typ = factory.getType();
                        if (typ === 'income') {
                            key -= 3;
                        }
                        newPathPrefix[3]++;
                        newPathPrefix[4 + key] = id;
                        newPathPrefix = factory.replaceAllCommasWithSlashes(newPathPrefix.toString());

                        // Change the path
                        $rootScope.$apply(function(){
                            $location.path(newPathPrefix, false, field, id);
                        });
                    }
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

    /*
    *       Helper method that replaces all commas in the given string with a slash
    * */
    factory.replaceAllCommasWithSlashes = function(stringToFix) {
        var changed = true;

        do {
            var beforeReplace = stringToFix;
            stringToFix = stringToFix.replace(',', '/');
            if (beforeReplace === stringToFix) {
                changed = false;
            }
        } while (changed);

        return stringToFix;
    };

    return factory;

});