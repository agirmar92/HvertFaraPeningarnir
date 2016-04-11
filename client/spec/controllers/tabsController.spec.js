/**
 * Created by agirmar on 11.4.2016.
 */

var populateOptions = function(options) {
    // Generating mock data
    for (var i = 0; i < 7; i++) {
        for (var k = 0; k < 4; k++) {
            var newChoice = {
                choiceId: k,
                content: "slice" + k + "inOption" + i,
                chosen: false,
                key: k
            };
            options[i].choices.push(newChoice);
        }
    }
}

describe("TabsController > ", function() {
    var scope, rootScope, location, hfpResource, tabResource;

    /*
     *       Setting up the app
     * */
    beforeEach(module('hvertfarapeningarnir'));
    beforeEach(inject(function (_$controller_, _$rootScope_, _$location_, _hfpResource_, _tabResource_) {
        scope = _$rootScope_.$new();

        _$controller_('tabsController', {
            $scope: scope,
            $controller: _$controller_,
            $rootScope: _$rootScope_,
            $location: _$location_,
            $hfpResource: _hfpResource_,
            $tabResource: _tabResource_
        });

        location = _$location_;
        rootScope = _$rootScope_;
        hfpResource = _hfpResource_;
        tabResource = _tabResource_;

        location.path("/expenses/2014-0/0/n/n/n/n/n");

        populateOptions(rootScope.options);
    }));

    /*
     *       Test suite for function changeView(toExpenses)
     * */
    describe("changeView > ", function() {
        // Predicate: (toExpenses !== $rootScope.expenses) to true
        it("should change view from expenses to income", function() {
            // Assert before the change
            expect(rootScope.expenses).toBe(true);

            scope.changeView(false);
            // Assert after the change
            expect(rootScope.expenses).toEqual(false);
            expect(location.path()).toEqual("/income/2014-0/3/n/n/");
        });
        // Predicate: (toExpenses !== $rootScope.expenses) to false
        it("should try to change view to current view", function() {
            // Assert before the change
            expect(rootScope.expenses).toBe(true);

            scope.changeView(true);
            // Assert after the change
            expect(rootScope.expenses).toEqual(true);
            expect(location.path()).toEqual("/expenses/2014-0/0/n/n/n/n/n");
        });
    });

    /*
     *       Test suite for function optionClicked(optionId)
     * */
    describe("optionClicked > ", function() {
        // Predicate: (!$rootScope.expenses) to true AND (hfpResource.getLevel() === optionId) to true
        it("should click already expanded option (viewing expenses)", function() {
            var optionId = 0;

            // Assert before the change
            expect(rootScope.options[optionId].currChoice).toEqual(-1);
            expect(rootScope.expenses).toBe(true);

            // Click option of same level
            scope.optionClicked(optionId);

            // Assert after the change
            expect(rootScope.options[optionId].currChoice).toEqual(-1);
            expect(rootScope.expenses).toEqual(true);
            expect(location.path()).toEqual("/expenses/2014-0/0/n/n/n/n/n");
        });
        // Predicate: (!$rootScope.expenses) to false
        it("should click already expanded option (viewing income)", function() {
            var optionId = 3;

            // Assert before the change
            scope.changeView(false);
            expect(rootScope.options[optionId].currChoice).toEqual(-1);
            expect(rootScope.expenses).toBe(false);

            // Click option of same level
            scope.optionClicked(optionId);

            // Assert after the change
            expect(rootScope.options[optionId].currChoice).toEqual(-1);
            expect(rootScope.expenses).toEqual(false);
            expect(location.path()).toEqual("/income/2014-0/3/n/n/");
        });

        // Predicate: (hfpResource.getLevel() === optionId) to false AND ($rootScope.options[optionId].currChoice !== -1) to false
        it("should click a different option that currently expanded", function() {
            var optionId = 1;

            // Assert before the change
            expect(rootScope.options[optionId].currChoice).toEqual(-1);
            expect(rootScope.expenses).toBe(true);

            // Click option of a different level
            scope.optionClicked(optionId);

            // Assert after the change
            expect(rootScope.options[optionId].currChoice).toEqual(-1);
            expect(rootScope.expenses).toEqual(true);
            expect(location.path()).toEqual("/expenses/2014-0/1/n/n/n/n/n");
        });

        // Predicate: ($rootScope.options[optionId].currChoice !== -1) to true
        it("should click a different option that currently expanded that already has a selected choice", function() {
            var optionId = 0;
            var choiceId = 0;

            // Assert before the change
            scope.choiceClicked(optionId, choiceId);
            hfpResource.setLevel(optionId + 1);
            rootScope.options[optionId].currChoice = 0;
            rootScope.options[optionId].choices[choiceId].chosen = true;

            expect(rootScope.options[optionId].currChoice).toEqual(0);
            expect(rootScope.expenses).toBe(true);
            expect(location.path()).toEqual("/expenses/2014-0/1/0/n/n/n/n");

            // Click option of a different level
            scope.optionClicked(optionId);

            // Assert after the change
            expect(rootScope.options[optionId].currChoice).toEqual(-1);
            expect(rootScope.expenses).toEqual(true);
            expect(location.path()).toEqual("/expenses/2014-0/0/n/n/n/n/n");
        });
    });

    /*
     *       Test suite for function choiceClicked(option, choice)
     * */
    describe("choiceClicked > ", function() {
        // Predicate: (option === 7) to true
        it("should select a creditor, which does nothing", function() {
            var optionId = 7;
            var choiceId = 0;

            // Assert before the change
            scope.optionClicked(optionId);
            expect(rootScope.options[optionId].currChoice).toEqual(-1);
            expect(rootScope.expenses).toBe(true);

            // Click the given choice
            scope.choiceClicked(optionId, choiceId);

            // Assert after the change
            expect(rootScope.options[optionId].currChoice).toEqual(-1);
            expect(rootScope.expenses).toEqual(true);
            expect(location.path()).toEqual("/expenses/2014-0/7/n/n/n/n/n");
        });
        // Predicate: (option === 7) to false AND (!$rootScope.expenses) to false
        it("should select the first choice (viewing expenses)", function() {
            var optionId = 0;
            var choiceId = 0;

            // Assert before the change
            scope.optionClicked(7);
            expect(rootScope.options[optionId].currChoice).toEqual(-1);
            expect(rootScope.expenses).toBe(true);

            // Click the given choice
            scope.choiceClicked(optionId, choiceId);

            // Assert after the change
            expect(rootScope.options[optionId].currChoice).toEqual(-1);
            expect(rootScope.expenses).toEqual(true);
            expect(location.path()).toEqual("/expenses/2014-0/1/0/n/n/n/n");
        });

        // Predicate: (!$rootScope.expenses) to true AND (!$rootScope.options[option].choices[choice].chosen) to true
        it("should select the first choice (viewing income)", function() {
            var optionId = 3;
            var choiceId = 0;

            // Assert before the change
            scope.changeView(false);
            populateOptions(rootScope.options);
            expect(rootScope.options[optionId].currChoice).toEqual(-1);
            expect(rootScope.expenses).toBe(false);

            // Click the given choice
            scope.choiceClicked(optionId, choiceId);

            // Assert after the change
            expect(rootScope.options[optionId].currChoice).toEqual(-1);
            expect(rootScope.expenses).toEqual(false);
            expect(location.path()).toEqual("/income/2014-0/4/0/n/");
        });

        // Predicate: (!$rootScope.options[option].choices[choice].chosen) to false
        it("should select the first choice, after it's already been chosen", function() {
            var optionId = 0;
            var choiceId = 0;

            // Assert before the change
            scope.choiceClicked(optionId, choiceId);
            rootScope.options[optionId].currChoice = 0;
            rootScope.options[optionId].choices[choiceId].chosen = true;

            expect(rootScope.options[optionId].currChoice).toEqual(0);
            expect(rootScope.options[optionId].choices[choiceId].chosen).toBe(true);
            expect(rootScope.expenses).toBe(true);
            expect(location.path()).toEqual("/expenses/2014-0/1/0/n/n/n/n");

            // Click the given choice
            scope.choiceClicked(optionId, choiceId);
            rootScope.options[optionId].currChoice = -1;
            rootScope.options[optionId].choices[choiceId].chosen = false;

            // Assert after the change
            expect(rootScope.options[optionId].currChoice).toEqual(-1);
            expect(rootScope.options[optionId].choices[choiceId].chosen).toBe(false);
            expect(rootScope.expenses).toEqual(true);
            expect(location.path()).toEqual("/expenses/2014-0/1/n/n/n/n/n");
        });
    });
});