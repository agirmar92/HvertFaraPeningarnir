/**
 * Created by agirmar on 28.3.2016.
 */
hfpApp.factory('tabResource', function($http, $q, $rootScope) {
    // Create empty factory
    var factory = {};

    /*
    *       Animates the choice clicked and returns true if the choice is about to be chosen
    *       and false if it is about to be un-chosen
    * */
    factory.choiceClicked = function(option, choice) {
        // If another choice is already chosen, un-choose it
        if ($rootScope.options[option].currChoice !== choice && $rootScope.options[option].currChoice !== -1) {
            $rootScope.options[option].choices[$rootScope.options[option].currChoice].chosen = false;
        }

        // Toggle the choice to be either chosen or un-chosen
        $rootScope.options[option].choices[choice].chosen = !$rootScope.options[option].choices[choice].chosen;

        // Update the current choice for the option
        if ($rootScope.options[option].choices[choice].chosen) {
            $rootScope.options[option].currChoice = choice;
        } else {
            $rootScope.options[option].currChoice = -1;
        }
        // Expand/collapse the option and open the next that is unlocked
        factory.toggleOption(option);
        if ($rootScope.options[option].choices[choice].chosen) {
            var i = option + 1;
            while (i < 8 && $rootScope.options[i].currChoice !== -1) {
                i++;
            }
            factory.toggleOption(i);
            return i;
        }
        return -1;
    };

    factory.toggleOption = function(optionId) {
        if (optionId < 8) {
            if ($rootScope.expandedOption === optionId) {
                // Collapse the option
                $rootScope.options[optionId].open = false;
                $rootScope.expandedOption = -1;
            } else {
                // Expand the option
                if ($rootScope.expandedOption !== -1) {
                    // Collapse currently open option
                    $rootScope.options[$rootScope.expandedOption].open = false;
                }
                $rootScope.expandedOption = optionId;
                $rootScope.options[$rootScope.expandedOption].open = true;
            }
        }
    };

    factory.optionClicked = function(optionId) {
        factory.toggleOption(optionId);

        if ($rootScope.options[optionId].currChoice !== -1) {
            $rootScope.options[optionId].choices[$rootScope.options[optionId].currChoice].chosen = false;
            $rootScope.options[optionId].currChoice = -1;
        }
    };

    return factory;
});