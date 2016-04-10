/**
 * Created by agirmar on 20.3.2016.
 */
hfpApp.controller('tabsController', function ($scope, $http, $window, $rootScope, $location, hfpResource, tabResource, LEVELS, INITIAL_VALUES) {
    // true = view expenses ; false = view income
    $rootScope.expenses = true;
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
        $rootScope.expenses = !$rootScope.expenses;
        hfpResource.resetApp();
    };

    /*
    *       Option with the id [id] has been clicked.
    *       Expand the option's choices if not already expanded.
    * */
    $scope.optionClicked = function(optionId) {
        var paramPosition = Math.min(4, optionId);
        if (!$rootScope.expenses) {
            paramPosition -= 3;
        }

        if (hfpResource.getLevel() === optionId) {
            // Simply expand/collapse the option
            tabResource.optionClicked(optionId);
        } else {
            // Expand the clicked option and change to it's corresponding level
            var newPathPrefix = $location.path().split('/');
            newPathPrefix[3] = optionId;
            if ($rootScope.options[optionId].currChoice !== -1) {
                newPathPrefix[4 + paramPosition] = 'n';
                $rootScope.options[optionId].currChoice = -1;
            }
            $location.path(hfpResource.replaceAllCommasWithSlashes(newPathPrefix.toString()), false);
        }
    };

    // TODO: Fix client routing when higher level finance keys are unchecked while lower level finance keys are still checked

    /*
    *       Choice [choice] that belongs to the option [option] has been clicked.
    *       Either makes the choice chosen, or un-chosen (if it already is).
    * */
    $scope.choiceClicked = function(option, choice) {
        if (option === 7) {
            console.log("creditor selected, doing nothing.");
            return;
        }

        var paramPosition = Math.min(4, option);
        if (!$rootScope.expenses) {
            paramPosition -= 3;
        }

        var nextLevel = option + 1;
        var newFieldValue;
        var newPathPrefix = $location.path().split('/');

        if (!$rootScope.options[option].choices[choice].chosen) {
            // Drill down
            newFieldValue = $rootScope.options[option].choices[choice].key;

            while (nextLevel < 8 && $rootScope.options[nextLevel].currChoice !== -1) {
                nextLevel++;
            }

            newPathPrefix[3] = nextLevel;
        } else {
            // Drill up
            if (option === 5) {
                newFieldValue = newPathPrefix[4 + paramPosition].substr(0, 1) + '000';
            } else if (option === 6) {
                newFieldValue = newPathPrefix[4 + paramPosition].substr(0, 2) + '00';
            } else {
                newFieldValue = 'n';
            }
        }

        newPathPrefix[4 + paramPosition] = newFieldValue;
        newPathPrefix = hfpResource.replaceAllCommasWithSlashes(newPathPrefix.toString());

        // Change the path
        $location.path(newPathPrefix, false, tabResource.choiceClicked, option, choice, nextLevel);
    };
});