/**
 * Created by agirmar on 20.3.2016.
 */
hfpApp.controller('tabsController', function ($scope, $http, $window, $rootScope, hfpResource, $location, INITIAL_VALUES) {
    // true = view expenses ; false = view income
    $rootScope.expenses = true;
    $scope.expandedOption = 0;

    $scope.changeView = function(toExpenses) {
        $rootScope.expenses = toExpenses;
        if(toExpenses) {
            $location.path('/' + INITIAL_VALUES.TYPE + '/' + INITIAL_VALUES.PERIOD + '/' + INITIAL_VALUES.LEVEL_EX + '/n/n/n/n/n/', false);
        } else {
            //$location.path('/' + INITIAL_VALUES.TYPE + '/' + INITIAL_VALUES.PERIOD + '/' + INITIAL_VALUES.LEVEL_EX + '/n/n/n/n/n/', false);
            $location.path('/income/' + INITIAL_VALUES.PERIOD + '/' + INITIAL_VALUES.LEVEL_IN + '/n/n/', false);
        }
    };

    /*
    *       Function that expands the option with the given id and closes the currently expanded (if any).
    *       If the option to expand is already expanded, the function collapses it.
    * */
    $scope.toggleOption = function(optionId) {
        if (optionId < 8) {
            if ($scope.expandedOption === optionId) {
                // Collapse the option
                $scope.options[optionId].open = false;
                $scope.expandedOption = -1;
            } else {
                // Expand the option
                if ($scope.expandedOption !== -1) {
                    // Collapse currently open option
                    $scope.options[$scope.expandedOption].open = false;
                }
                $scope.expandedOption = optionId;
                $scope.options[$scope.expandedOption].open = true;
            }
        }
    };

    $scope.options = [
        {
            label: "Yfirmálaflokkar",
            optionId: 0,
            open: true,
            currChoice: -1,
            choices: [
                {
                    choiceId: 0,
                    content: "Menningarmál",
                    chosen: false
                },
                {
                    choiceId: 1,
                    content: "Menntamál",
                    chosen: false
                },
                {
                    choiceId: 2,
                    content: "Umhverfismál",
                    chosen: false
                }
            ]
        },
        {
            label: "Málaflokkar",
            optionId: 1,
            open: false,
            currChoice: -1,
            choices: [
                {
                    choiceId: 0,
                    content: "Fræðslumál",
                    chosen: false
                },
                {
                    choiceId: 1,
                    content: "Eignasjóður",
                    chosen: false
                },
                {
                    choiceId: 2,
                    content: "Hreinlætismál",
                    chosen: false
                }
            ]
        },
        {
            label: "Millideildir",
            optionId: 2,
            open: false,
            currChoice: -1,
            choices: [
                {
                    choiceId: 0,
                    content: "Grunnskólar",
                    chosen: false
                },
                {
                    choiceId: 1,
                    content: "Leikskólar",
                    chosen: false
                },
                {
                    choiceId: 2,
                    content: "Elliheimili",
                    chosen: false
                }
            ]
        },
        {
            label: "Deildir",
            optionId: 3,
            open: false,
            currChoice: -1,
            choices: [
                {
                    choiceId: 0,
                    content: "Smáraskóli",
                    chosen: false
                },
                {
                    choiceId: 1,
                    content: "Kársnesskóli",
                    chosen: false
                },
                {
                    choiceId: 2,
                    content: "Leikskólinn Hvammur",
                    chosen: false
                }
            ]
        },
        {
            label: "Yfirfjárhagslyklar",
            optionId: 4,
            open: false,
            currChoice: -1,
            choices: [
                {
                    choiceId: 0,
                    content: "1000-Starfsmannakostnaður",
                    chosen: false
                },
                {
                    choiceId: 1,
                    content: "4000-Þjónustukaup",
                    chosen: false
                },
                {
                    choiceId: 2,
                    content: "7000-Fjármagnsliðir",
                    chosen: false
                }
            ]
        },
        {
            label: "Millifjárhagslyklar",
            optionId: 5,
            open: false,
            currChoice: -1,
            choices: [
                {
                    choiceId: 0,
                    content: "Önnur vörukaup",
                    chosen: false
                },
                {
                    choiceId: 1,
                    content: "Þjónusta",
                    chosen: false
                },
                {
                    choiceId: 2,
                    content: "Eitthvað",
                    chosen: false
                }
            ]
        },
        {
            label: "Fjárhagslyklar",
            optionId: 6,
            open: false,
            currChoice: -1,
            choices: [
                {
                    choiceId: 0,
                    content: "Derka",
                    chosen: false
                },
                {
                    choiceId: 1,
                    content: "Blabla",
                    chosen: false
                },
                {
                    choiceId: 2,
                    content: "Klósettpappír",
                    chosen: false
                }
            ]
        },
        {
            label: "Lánadrottnar",
            optionId: 7,
            open: false,
            currChoice: -1,
            choices: [
                {
                    choiceId: 0,
                    content: "Strætó",
                    chosen: false
                },
                {
                    choiceId: 1,
                    content: "Vodafone",
                    chosen: false
                },
                {
                    choiceId: 2,
                    content: "Goldfinger",
                    chosen: false
                }
            ]
        }
    ];

    /*
    *       Option with the id [id] has been clicked.
    *       Expand the option's choices if not already expanded.
    * */
    $scope.optionClicked = function(id) {
        $scope.toggleOption(id);

        if ($scope.options[id].currChoice !== -1) {
            $scope.options[id].choices[$scope.options[id].currChoice].chosen = false;
            $scope.options[id].currChoice = -1;
        }
    };

    /*
    *       Choice [choice] that belongs to the option [option] has been clicked.
    *       Either makes the choice chosen, or un-chosen (if it already is).
    * */
    $scope.choiceClicked = function(option, choice) {
        // If another choice is already chosen, un-choose it
        if ($scope.options[option].currChoice !== choice && $scope.options[option].currChoice !== -1) {
            $scope.options[option].choices[$scope.options[option].currChoice].chosen = false;
        }

        // Toggle the choice to be either chosen or un-chosen
        $scope.options[option].choices[choice].chosen = !$scope.options[option].choices[choice].chosen;

        // Update the current choice for the option
        if ($scope.options[option].choices[choice].chosen) {
            $scope.options[option].currChoice = choice;
        } else {
            $scope.options[option].currChoice = -1;
        }
        // Expand/collapse the option and open the next that is unlocked
        $scope.toggleOption(option);
        if ($scope.options[option].choices[choice].chosen) {
            var i = option + 1;
            while (i < 8 && $scope.options[i].currChoice !== -1) {
                i++;
            }
            $scope.toggleOption(i);
        }
    };
});