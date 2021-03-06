/**
 * Created by agirmar on 28.3.2016.
 */
hfpApp.factory('tabResource', function($http, $q, $rootScope) {
    // Create empty factory
    var factory = {};

    /*
    *       Animates the choice clicked in the sidebar
    * */
    factory.choiceClicked = function(option, choice, nextLevel, isUnchoosingCreditor) {
        // If unchoosing a creditor while being in the top level
        if (isUnchoosingCreditor) {
            $rootScope.options[option].currChoice = -1;
            return;
        }
        
        // If choosing a creditor the choices array has been reduced to a single entry, so the choice is always = 0
        if (option === 7) {
            choice = 0;
        }

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
    };

    /*
    *       Animates the option clicked in the sidebar
    * */
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

    /*
    *       Toggles the clicked option in sidebar
    * */
    factory.optionClicked = function(optionId) {
        factory.toggleOption(optionId);

        // Unchoose the current choice before expanding the option
        if ($rootScope.options[optionId].currChoice !== -1) {
            $rootScope.options[optionId].currChoice = -1;
        }
    };

    return factory;
});