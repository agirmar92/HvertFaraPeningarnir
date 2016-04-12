/**
 * Created by agirmar on 24.3.2016.
 */
hfpApp.factory('hfpResource', function($http, $q, $routeParams, $route, $location, tabResource, INITIAL_VALUES, API_URL, COLORS, CHART_TEXT_COLOR, LEVELS, URL_PARAMS, MONTHS, QUARTERS, $rootScope) {

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
    var choices = [];
    var totalCredit = 0;
    var totalDebit = 0;
    var totalC = 32321545934;
    var totalD = 18529125975;
    var dynamic = 100;
    var clickedSlice = "";
    var clickedSliceLabel = "";
    var deepest = "";
    var affairGroup = "all";
    var affair = "all";
    var departmentGroup = "all";
    var department = "all";
    var financeKey = "all";

    /*
    *       Getters
    * */
    factory.getLevel = function() {
        if (factory.getType() === 'joint-revenue') {
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
    factory.getChoices = function() {
        return choices;
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
    factory.getTotalYearSpec = function() {
        return 11089287535;
    };
    factory.getDynamic = function() {
        return dynamic;
    };
    factory.getClickedSlice = function() {
        return clickedSlice;
    };
    factory.getClickedSliceLabel = function() {
        return clickedSliceLabel;
    };
    factory.getDeepest = function() {
        return deepest;
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
        if (factory.getType() === 'joint-revenue') {
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
    factory.setChoices= function(newChoices) {
        choices = newChoices;
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
    factory.setClickedSliceLabel = function(newclickedSliceLabel) {
        clickedSliceLabel = newclickedSliceLabel;
    };
    factory.setDeepest = function(newDeepest) {
        deepest = newDeepest;
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
        if (factory.getType() !== 'joint-revenue') {
            queryURL = API_URL + this.getType() + '/' + this.getPeriod() + '/' + this.getLevel() + '/' + this.getAffairGroup() + '/' + this.getAffair() + '/' + this.getDepartmentGroup() + '/' + this.getDepartment() + '/' + this.getFinanceKey();
        } else {
            queryURL = API_URL + this.getType() + '/' + this.getPeriod() + '/' + this.getLevel() + '/' + this.getDepartment() + '/' + this.getFinanceKey();
        }
        
        $http({
            // Fetch the data
            method: 'GET',
            url: queryURL
        }).success(function (response) {
            // Change the slices
            var sliceNumber = 0;
            var currLvl = factory.getLevel();
            console.log('currLvl: ' + currLvl);

            var newSlices = [];
            var newChoices = [];
            response.slices.map(function(slice) {
                var cut = 0;
                var newSlice = {};
                var newChoice = {};
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
                        color: COLORS[sliceNumber % 8],
                        key: slice.key
                    };
                    newChoice = {
                        choiceId: sliceNumber,
                        content: slice.key,
                        chosen: false,
                        key: slice.key
                    };
                } else {
                    cut = 4;
                }
                if (factory.getLevel() < 7) {
                    newSlice = {
                        label: slice.key.substring(cut + 1),
                        value: slice.sum_amount.value,
                        color: COLORS[sliceNumber % 8],
                        key: slice.key.substring(0,cut)
                    };
                    newChoice = {
                        choiceId: sliceNumber,
                        content: slice.key.substring(cut + 1),
                        chosen: false,
                        key: slice.key.substring(0,cut)
                    };
                }
                sliceNumber++;
                newSlices.push(newSlice);
                newChoices.push(newChoice);
            });

            factory.setSlices(newSlices);
            factory.setChoices(newChoices);

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
                if (factory.getType() === 'joint-revenue') {
                    factory.setDynamic((factory.getTotalDebit() / factory.getTotalD() * 100).toFixed(1));
                } else {
                    factory.setDynamic((factory.getTotalDebit() / factory.getTotalYearSpec() * 100).toFixed(1));
                }


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

        console.log("parsing");

        for (var param in params) {
            var typ = factory.getType();
            var value = params[param];
            param = URL_PARAMS[typ][parseInt(param) - 1];
            if (param === undefined) {
                continue;
            }
            if (value === 'n') {
                value = 'all';
            } else if (param === 'Level') {
                value = parseInt(value);
                if ($rootScope.expandedOption !== value) {
                    tabResource.toggleOption(value);
                }
            }
            console.log(param + ": " + value);
            factory['set' + param](value);
        }
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

    /*
    *       Search function that searches for a choice with a given key in the given array.
    *       Return the choice if found, else null.
    * */
    factory.searchChoice = function (myKey, myArray) {
        for (var i=0; i < myArray.length; i++) {
            if (myArray[i].key === myKey) {
                return myArray[i];
            }
        }
        return null;
    };

    /*
    *       Method that resets the app to it's inital state
    * */
    factory.resetApp = function() {
        for (var i = 0; i < 8;  i++) {
            $rootScope.options[i].choices = [];
            $rootScope.options[i].currChoice = -1;
        }
        if ($rootScope.type === 'expenses') {
            $location.path('/' + INITIAL_VALUES.TYPE + '/' + INITIAL_VALUES.PERIOD + '/' + INITIAL_VALUES.LEVEL_EX + '/n/n/n/n/n', false);
        } else if ($rootScope.type === 'joint-revenue') {
            $location.path('/joint-revenue/' + INITIAL_VALUES.PERIOD + '/' + INITIAL_VALUES.LEVEL_IN + '/n/n/', false);
        } else {
            $location.path('/special-revenue/' + INITIAL_VALUES.PERIOD + '/' + INITIAL_VALUES.LEVEL_EX + '/n/n/n/n/n', false);
        }
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
        $rootScope.type = factory.getType();
        factory.updateBreadcrumbs();

        // Choices in sidebar
        $rootScope.options[factory.getLevel()].choices = factory.getChoices();

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
                    factory.setClickedSliceLabel(a.data.label);
                    var id = a.data.key;
                    var key;
                    var lvl = factory.getLevel();
                    console.log("lvl: " + lvl);
                    if (parseInt(lvl) === 0) {
                        key = 0;
                    } else if (lvl === 1) {
                        key = 1;
                    } else if (lvl === 2) {
                        key = 2;
                    } else if (lvl === 3) {
                        factory.setDeepest(a.data.label);
                        key = 3;
                    } else if (lvl > 3 && lvl < 7) {
                        key = 4;
                    } else if (lvl === 7) {
                        console.log('Þú ert kominn niður á botninn.');
                    }
                    //if (lvl < 7) {    TODO: put back in when creditors are allowed
                    if (lvl < 6) {
                        // Create a new path with a incremented level
                        var newPathPrefix = $location.path().split('/');
                        var typ = factory.getType();
                        if (typ === 'joint-revenue') {
                            key -= 3;
                        }

                        // fetch the equivalent choice in the sidebar and select it
                        var option = factory.getLevel();
                        var eqChoice = factory.searchChoice(id, $rootScope.options[option].choices);

                        var nextLevel = option + 1;
                        while (nextLevel < 8 && $rootScope.options[nextLevel].currChoice !== -1) {
                            nextLevel++;
                        }

                        newPathPrefix[3] = nextLevel;
                        newPathPrefix[4 + key] = id;

                        newPathPrefix = factory.replaceAllCommasWithSlashes(newPathPrefix.toString());

                        //tabResource.choiceClicked(option, eqChoice.choiceId);

                        // Change the path
                        $rootScope.$apply(function(){
                            $location.path(newPathPrefix, false, tabResource.choiceClicked, option, eqChoice.choiceId, nextLevel);
                        });
                        
                        factory.updateBreadcrumbs();
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
    
    factory.translate = function() {
        var typo = factory.getType();
        if (typo === 'expenses') {
            return 'Gjöld';
        } else if (typo === 'joint-revenue') {
            return 'Sameiginlegar Tekjur';
        } else if (typo === 'special-revenue') {
            return 'Sértekjur';
        }
    };

    factory.deepest = function(label) {
        var lvl = parseInt(factory.getLevel());
        if (lvl === 0) {
            return 'Kópavogur';
        } else if (lvl < 5) {
            return factory.getClickedSliceLabel();
        } else {
            return factory.getDeepest() + ', ' + factory.getClickedSliceLabel();
        }
    };

    factory.tDate = function () {
        var perio = factory.getPeriod();
        var year = perio.substring(0,4);
        if (perio.length === 6) {
            if (perio.charAt(5) === '0') {
                return year;
            } else {
                var quarter = parseInt(perio.charAt(5));
                return year + ' (' + QUARTERS[quarter] + ' ársfjórðungur)';
            }
        } else {
            var month = parseInt(perio.substring(5,7), 10);
            return year + ' (' + MONTHS[month] + ')';
        }
    };

    factory.updateBreadcrumbs = function () {
        $rootScope.breadcrumb = factory.translate() + ', ' + factory.tDate() + ', ' + factory.deepest();
    };

    return factory;

});