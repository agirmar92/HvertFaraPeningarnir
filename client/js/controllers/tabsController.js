/**
 * Created by agirmar on 20.3.2016.
 */
hfpApp.controller('tabsController', function ($scope, $http, $window, $rootScope, $location, hfpResource, tabResource) {
    $rootScope.type = 'expenses';
    $rootScope.currentLevel = 0;
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

    $scope.changeView = function(toType) {
        if (toType !== $rootScope.type) {
            $rootScope.type = toType;
            hfpResource.resetApp();
        }
    };

    /* Helper for autocomplete search box */
    function createFilterFor(searchText) {
        var lowercase = angular.lowercase(searchText);
        return function filterFn(slice) {
            return (angular.lowercase(slice.label).indexOf(lowercase) === 0);
        };
    }

    /* Flag for show/hide autocomplete search box */
    $rootScope.creditorSearchActive = true;

    /* Select a creditor in autocomplete search box */
    $scope.selectedItemChange = function(slice) {
        if (slice) {
            $scope.choiceClicked(7, slice.choice);
        } else {
            $scope.choiceClicked(7, 0);
        }
    };

    /* Autocomplete search box for creditors */
    $scope.getMatches = function(searchText) {
        var slices = hfpResource.getSlices();
        for (var i = 0; i < slices.length; i++) {
            slices[i].choice = i;
        }
        var results = searchText ? slices.filter(createFilterFor(searchText)) : slices;
        return results;
    };

    /*
    *       Option with the id [id] has been clicked.
    *       Expand the option's choices if not already expanded.
    * */
    $scope.optionClicked = function(optionId) {
        if (optionId === 7) {
            $rootScope.creditorSearchActive = true;
        }
        // Find the correct index of route parameter
        var paramPosition = (optionId === 7) ? 5 : Math.min(4, optionId);
        if ($rootScope.type === 'joint-revenue') {
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

    /*
    *       Choice [choice] that belongs to the option [option] has been clicked.
    *       Either makes the choice chosen, or un-chosen (if it already is).
    * */
    $scope.choiceClicked = function(option, choice) {
        // If user is at the deepest level
        if (option === 8) {
            // TODO: Display message informing user that he has reached the bottom.
            return;
        }

        var paramPosition = (option === 7) ? 5 : Math.min(4, option);
        if ($rootScope.type === 'joint-revenue') {
            paramPosition -= 3;
        }

        var nextLevel = (option === 7) ? option : option + 1;
        var newFieldValue;
        var newPathPrefix = $location.path().split('/');

        if (!$rootScope.options[option].choices[choice].chosen) {
            // Drill down
            newFieldValue = $rootScope.options[option].choices[choice].key;

            // Find the next level to expand
            while (nextLevel < 7 && $rootScope.options[nextLevel].currChoice !== -1) {
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
        $location.path(newPathPrefix, false, tabResource.choiceClicked, option, choice, nextLevel, (option === 7 && $rootScope.options[option].currChoice !== -1 && hfpResource.getLevel() === 7));
    };

    $scope.resetApp = function () {
        hfpResource.resetApp();
    };

    $scope.pathChange = function (newPath) {
        // Change the path
        $location.path(newPath, false);
    };
});