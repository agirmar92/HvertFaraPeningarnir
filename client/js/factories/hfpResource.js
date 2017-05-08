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
    var totalS = 11089287535;
    var currYear = 2014;
    var dynamic = 100;
    var clickedSlice = "";
    var clickedSliceLabel = "";
    var affairGroup = "all";
    var affair = "all";
    var departmentGroup = "all";
    var department = "all";
    var financeKey = "all";
    var creditor = "all";
    var pieHeight = 0;
    var pieWidth = 0;
    var pieRadius = 0;
    var pathLabels;

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
    factory.getTotalS = function() {
        return totalS;
    };
    factory.getCurrYear = function() {
        return currYear;
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
    factory.getCreditor = function() {
        return creditor;
    };
    factory.getPieHeight = function() {
        return pieHeight;
    };
    factory.getPieWidth = function() {
        return pieWidth;
    };
    factory.getPieRadius = function() {
        return pieRadius;
    };
    factory.getPathLabels = function() {
        return pathLabels;
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
    factory.setTotalS = function(newTotalS) {
        totalS = newTotalS;
    };
    factory.setCurrYear = function(newYear) {
        currYear = newYear;
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
    factory.setCreditor = function(newCreditor) {
        creditor = newCreditor;
    };
    factory.setPieHeight = function(newPieHeight) {
        pieHeight = newPieHeight;
    };
    factory.setPieWidth = function(newPieWidth) {
        pieWidth = newPieWidth;
    };
    factory.setPieRadius = function(newPieRadius) {
        pieRadius = newPieRadius;
    };
    factory.setPathLabels = function(newPathLabels) {
        pathLabels = newPathLabels;
    };

    /*
    *       Public methods
    * */

    $rootScope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    /*
    *       Method for when a slice is clicked, prepares the app for a drilldown.
    * */
    factory.sliceClicked = function(a) {
        factory.setClickedSlice(a.data.key);
        factory.setClickedSliceLabel(a.data.label);
        var id = a.data.key;
        var pathIndex;
        var lvl = factory.getLevel();
        // Finding position to cut off label
        if (lvl >= 0 && lvl <= 3) {
            pathIndex = lvl;
        } else if (lvl > 3 && lvl < 7) {
            pathIndex = 4;
        } else if (lvl === 7) {
            pathIndex = 5;
        }

        if (lvl < 8) {
            // Create a new path with a incremented level
            var newPathPrefix = $location.path().split('/');
            var typ = factory.getType();
            if (typ === 'joint-revenue') {
                pathIndex -= 3;
            }

            // fetch the equivalent choice in the sidebar and select it
            var currLevel = factory.getLevel();
            var eqChoice = factory.searchChoice(id, $rootScope.options[currLevel].choices);

            var nextLevel = (currLevel === 7) ? currLevel : currLevel + 1;
            // Find the highest level (smallest number) that has no locked in choice.
            while (nextLevel < 7 && $rootScope.options[nextLevel].currChoice !== -1) {
                nextLevel++;
            }

            newPathPrefix[3] = nextLevel;
            newPathPrefix[4 + pathIndex] = id;

            newPathPrefix = factory.replaceAllCommasWithSlashes(newPathPrefix.toString());
            // Change the path
            $rootScope.safeApply(function(){
                $location.path(newPathPrefix, false, tabResource.choiceClicked, currLevel, eqChoice.choiceId, nextLevel, (currLevel === 7 && $rootScope.options[currLevel].currChoice !== -1));
            });
        }
    };

    /*
    *       Method that takes the current state of the app (filters and variables), fetches the appropriate data
    *       and recreates that charts to show the newly fetched data.
    *       If parameter 'firstTime' is true, then this is the app initialization.
    * */
    factory.showMeTheMoney = function(firstTime, to7fromAnyWithSelectedCreditor) {
        var deferred = $q.defer();
        var queryURL;
        if (factory.getType() !== 'joint-revenue') {
            queryURL = API_URL + this.getType() + '/' + this.getPeriod() + '/' + this.getLevel() + '/' + this.getAffairGroup() + '/' + this.getAffair() + '/' + this.getDepartmentGroup() + '/' + this.getDepartment() + '/' + this.getFinanceKey() + '/' + this.getCreditor();
        } else {
            queryURL = API_URL + this.getType() + '/' + this.getPeriod() + '/' + this.getLevel() + '/' + this.getDepartment() + '/' + this.getFinanceKey() + '/' + this.getCreditor();
        }

        $http({
            // Fetch the data
            method: 'GET',
            url: queryURL
        }).success(function (response) {
            // If this is the first fetching money, set the filters like they should be and set the initial size of the chart
            if (firstTime) {
                to7fromAnyWithSelectedCreditor = setFilters(response.labels);
                factory.setPieHeight($('#hfpPie').height());
                factory.setPieWidth($('#hfpPie').width());
                factory.setPieRadius(Math.min($('#hfpPie').width() * 0.2, $('#hfpPie').height() * 0.25));
            }
            $rootScope.alerts = [];
            var pieContainsNegativeSlice = false;
            // Change the slices
            var sliceNumber = 0;
            var currLvl = factory.getLevel();
            
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
                } else {
                    cut = slice.key.indexOf('-');
                }

                if (currLvl < 7) {
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
                } else {
                    newSlice = {
                        label: slice.aggs.buckets[0].key,
                        value: slice.sum_amount.value,
                        color: COLORS[sliceNumber % 8],
                        key: slice.key
                    };
                    newChoice = {
                        choiceId: sliceNumber,
                        content: slice.aggs.buckets[0].key,
                        chosen: to7fromAnyWithSelectedCreditor, // Set to true if flag is set
                        key: slice.key
                    };
                }

                sliceNumber++;
                newSlices.push(newSlice);
                newChoices.push(newChoice);
                if (newSlice.value <= 0) {
                    pieContainsNegativeSlice = true;
                }
            });

            factory.setSlices(newSlices);
            factory.setChoices(newChoices);

            if ($rootScope.isMobile() && $rootScope.pieView) {
                // Never display pie in mobile
                $rootScope.changeView();
            } else if ($rootScope.pieView && factory.getSlices().length >= 30) {
                // Change to table view if there are too many slices in pie.
                $rootScope.changeView();
                // Notify user that there are too many slices in the pie to show. Switching to table.
                $rootScope.alerts.push({
                    type: 'info',
                    msg: 'ATH! Of margar sneiðar í kökunni, gögnin sýnd í töflu í staðinn.'
                });
            } else if (pieContainsNegativeSlice && $rootScope.pieView && !$rootScope.isMobile()) {
                // Show notification if negative slices exist in pie
                $rootScope.alerts.push({
                    type: 'info',
                    msg: 'ATH! Þessi kaka inniheldur sneiðar með mínusgildi sem eru ekki sýndar í kökunni. Skiptu yfir í töflusýn til að sjá öll gögnin.'
                });
            }

            // Change the total amounts
            factory.setTotalCredit(response.totalCredit);
            factory.setTotalDebit(response.totalDebit);

            var year = factory.getPeriod().substring(0,4);
            if (factory.getCurrYear() !== year) {
                factory.setCurrYear(year);
            }

            // Change the path properties for breadcrumbs
            factory.setPathLabels(response.labels);

            // Updating bar chart data
            $rootScope.chart.options.data[0].dataPoints[0].y = factory.getTotalCredit();
            $rootScope.chart.options.data[0].dataPoints[1].y = factory.getTotalDebit();

            // Update percentage bar and total amounts for whole year
            if (factory.getType() === 'expenses') {
                // Expenses
                $rootScope.chart.options.data[0].dataPoints[2].y = factory.getTotalCredit() - factory.getTotalDebit();
                // Change total credit for whole year
                factory.setTotalC(response.totalYear);
                // Change the percentage number
                factory.setDynamic((factory.getTotalCredit() / factory.getTotalC() * 100).toFixed(1));

                // Change total credit to have dots every the digits
                factory.setTotalCredit(factory.toNrWithDots(factory.getTotalCredit()));
            } else {
                $rootScope.chart.options.data[0].dataPoints[2].y = factory.getTotalDebit() - factory.getTotalCredit();
                // Change the percentage number
                if (factory.getType() === 'joint-revenue') {
                    // Change total joint revenue for whole year
                    factory.setTotalD(response.totalYear);
                    factory.setDynamic((factory.getTotalDebit() / factory.getTotalD() * 100).toFixed(1));
                } else {
                    // Change total special revenue for whole year
                    factory.setTotalS(response.totalYear);
                    factory.setDynamic((factory.getTotalDebit() / factory.getTotalS() * 100).toFixed(1));
                }
                // Change total debit to have dots every three digits
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
    *   Method that takes a numberstring with dots and converts to number without dots
    */
    factory.toNr = function (s) {
        var newS = '';
        for (var i = 0; i < s.length; i++) {
            if (s[i] !== '.') {
                newS += s[i];
            }
        }
        return newS;
    };

    /*
    *       Goes through the route parameters and sets the state of the app
    * */
    factory.parseRouteParams = function(params) {
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
    *       Method that resets the app to it's initial state with respect to the data type being viewed
    * */
    factory.resetApp = function() {
        // Clear all filter choices, expect for the base level
        var from = 1;
        if ($rootScope.type === 'joint-revenue') {
            from = 4;
        }
        for (var i = from; i < 8;  i++) {
            $rootScope.options[i].choices = [];
            $rootScope.options[i].currChoice = -1;
        }
        if ($rootScope.type === 'expenses') {
            $location.path('/' + INITIAL_VALUES.TYPE + '/' + factory.getPeriod() + '/' + INITIAL_VALUES.LEVEL_EX + '/n/n/n/n/n/n', false);
        } else if ($rootScope.type === 'joint-revenue') {
            $location.path('/joint-revenue/' + factory.getPeriod() + '/' + INITIAL_VALUES.LEVEL_IN + '/n/n/n', false);
        } else {
            $location.path('/special-revenue/' + factory.getPeriod() + '/' + INITIAL_VALUES.LEVEL_EX + '/n/n/n/n/n/n', false);
        }
        //$rootScope.resetPeriod();
    };

    /*
        Translate english to icelandic
     */
    factory.translate = function() {
        var typo = factory.getType();
        if (typo === 'expenses') {
            return 'Gjöld';
        } else if (typo === 'joint-revenue') {
            return 'Sameiginlegar tekjur';
        } else if (typo === 'special-revenue') {
            return 'Sértekjur';
        }
    };

    /*
        Returns a time period in human form
     */
    factory.tDate = function () {
        var perio = factory.getPeriod();
        var year = perio.substring(0,4);
        if (perio.length === 6) {
            if (perio.charAt(5) === '0' || perio.charAt(5) === '5') {
                return year;
            } else {
                var quarter = parseInt(perio.charAt(5));
                return year + ' - ' + QUARTERS[quarter] + ' ársfjórðungur';
            }
        } else {
            var month = parseInt(perio.substring(5,7), 10);
            if (MONTHS[month] === 'allt' || MONTHS[month] === 'allir') {
                return year;
            } else {
                return year + ' - ' + MONTHS[month];
            }

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
        $rootScope.currentLevel = factory.getLevel();

        // Choices in sidebar
        $rootScope.options[factory.getLevel()].choices = factory.getChoices();
        $rootScope.creditorSearchActive = (factory.getLevel() !== 7) ? false : $rootScope.creditorSearchActive;

        // Update views
        $rootScope.updateBarChart();
        $rootScope.updatePie();
        $rootScope.updateTable();
        $rootScope.updateBreadcrumbs();
    };

    /*
    *       Method called when initializing the app from and URL with set filters.
    *       Iterates through the given labels array and sets the corresponding filters.
    * */
    var setFilters = function(labels) {
        var creditorIsSelected = false;
        for (var i = 0; i < labels.length; i++) {
            var filterLevel = labels[i].level;
            if (filterLevel === 7) {
                creditorIsSelected = true;
            }
            var filterLabel = labels[i].label;

            $rootScope.options[filterLevel].choices.push({
                choiceId: 0,
                content: filterLabel,
                chosen: true,
                key: ''             // Unnecessary to set
            });
            $rootScope.options[filterLevel].currChoice = 0;
        }
        return creditorIsSelected;
    };

    return factory;
});
