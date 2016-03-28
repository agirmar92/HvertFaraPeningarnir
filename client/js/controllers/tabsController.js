/**
 * Created by agirmar on 20.3.2016.
 */
hfpApp.controller('tabsController', function ($scope, $http, $window, $rootScope, $location, hfpResource, tabResource, LEVELS) {
    // true = view expenses ; false = view income
    $scope.expenses = true;
    $rootScope.expandedOption = 0;
    $rootScope.options = [
        {
            label: "Yfirmálaflokkar",
            optionId: 0,
            open: true,
            currChoice: -1,
            /*
             *       choices = Object(choiceId, content, chosen, key)
             * */
            choices: []
        },
        {
            label: "Málaflokkar",
            optionId: 1,
            open: false,
            currChoice: -1,
            choices: []
        },
        {
            label: "Millideildir",
            optionId: 2,
            open: false,
            currChoice: -1,
            choices: []
        },
        {
            label: "Deildir",
            optionId: 3,
            open: false,
            currChoice: -1,
            choices: []
        },
        {
            label: "Yfirfjárhagslyklar",
            optionId: 4,
            open: false,
            currChoice: -1,
            choices: []
        },
        {
            label: "Millifjárhagslyklar",
            optionId: 5,
            open: false,
            currChoice: -1,
            choices: []
        },
        {
            label: "Fjárhagslyklar",
            optionId: 6,
            open: false,
            currChoice: -1,
            choices: []
        },
        {
            label: "Lánadrottnar",
            optionId: 7,
            open: false,
            currChoice: -1,
            choices: []
        }
    ];

    $scope.changeView = function(toExpenses) {
        $scope.expenses = toExpenses;
        if(toExpenses) {
            hfpResource.setType('expenses');
        } else {
            hfpResource.setType('income');
        }
        hfpResource.showMeTheMoney();
    };

    /*
    *       Function that expands the option with the given id and closes the currently expanded (if any).
    *       If the option to expand is already expanded, the function collapses it.
    * */
    $scope.toggleOption = function(optionId) {
        tabResource.toggleOption(optionId);
    };

    /*
    *       Option with the id [id] has been clicked.
    *       Expand the option's choices if not already expanded.
    * */
    $scope.optionClicked = function(optionId) {
        var newPathPrefix = $location.path().split('/');
        newPathPrefix[3] = optionId;

        hfpResource.setLevel(optionId);
        tabResource.optionClicked(optionId);
    };

    /*
    *       Choice [choice] that belongs to the option [option] has been clicked.
    *       Either makes the choice chosen, or un-chosen (if it already is).
    * */
    $scope.choiceClicked = function(option, choice) {
        var newFieldValue;
        var level = option;
        var levelName = LEVELS[level];
        if (option > 3) {
            levelName = 'FinanceKey';
            level = 4;
        }
        var newPathPrefix = $location.path().split('/');
        var nextLevel = tabResource.choiceClicked(option, choice);

        if (nextLevel !== -1) {
            // Drill down
            newFieldValue = $rootScope.options[option].choices[choice].key;
            hfpResource.setLevel(nextLevel);

            newPathPrefix[3] = nextLevel;
        } else {
            // Drill up
            if (option === 5) {
                newFieldValue = newPathPrefix[4 + level].substr(0, 1) + '000';
            } else if (option === 6) {
                newFieldValue = newPathPrefix[4 + level].substr(0, 2) + '00';
            } else {
                newFieldValue = 'n';
            }
            hfpResource.setLevel(option);

            newPathPrefix[3] = hfpResource.getLevel();
        }

        newPathPrefix[4 + level] = newFieldValue;
        newPathPrefix = hfpResource.replaceAllCommasWithSlashes(newPathPrefix.toString());

        // Change the path
        $location.path(newPathPrefix, false, 'set' + levelName, newFieldValue);
    };
});