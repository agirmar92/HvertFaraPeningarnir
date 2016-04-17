/**
 * Created by agirmar on 10.4.2016.
 */

describe("CalendarController > ", function() {
    var scope, location;

    /*
     *       Setting up the app
     * */
    beforeEach(module('hvertfarapeningarnir'));
    beforeEach(inject(function (_$controller_, _$rootScope_, _$location_) {
        scope = _$rootScope_.$new();

        _$controller_('calendarController', {
            $scope: scope,
            $controller: _$controller_,
            $location: _$location_
        });

        location = _$location_;

        location.path("/expenses/2014-0/0/n/n/n/n/n");
    }));

    /*
    *       Test suite for function setYear(year)
    * */
    describe("setYear > ", function() {
        // Predicate: (YEARS.indexOf(year) !== -1) to true
        it("should set year to 2013", function() {
            // Assert before the change
            expect(scope.selectedYear).toEqual('2014');
            scope.setYear('2013');
            // Assert after the change
            expect(scope.selectedYear).toEqual('2013');
        });

        // Predicate: (YEARS.indexOf(year) !== -1) to false
        it("should set year to something invalid", function() {
            // Assert before the change
            expect(scope.selectedYear).toEqual('2014');
            scope.setYear('derka');
            // Assert after the change
            expect(scope.selectedYear).toEqual('2014');
        });
    });

    /*
    *       Test suite for function setMonth(month)
    * */
    describe("setMonth > ", function() {
        // Predicate: (i < 10 && i !== 0) to true
        it("should set month to February", function() {
            // Assert before the change
            expect(scope.selectedMonth).toEqual("Veldu");

            scope.setMonth(2);
            // Assert after the change
            expect(scope.selectedMonth).toEqual("Febrúar");
            expect(location.path()).toEqual("/expenses/2014-02/0/n/n/n/n/n");
        });
        // Predicate: (i < 10 && i !== 0) to false
        it("should set month to December", function() {
            // Assert before the change
            expect(scope.selectedMonth).toEqual("Veldu");
            scope.setMonth(12);
            // Assert after the change
            expect(scope.selectedMonth).toEqual("Desember");
            expect(location.path()).toEqual("/expenses/2014-12/0/n/n/n/n/n");
        });
    });

    /*
    *       Test suite for function setQuarter(quarter)
    * */
    describe("setQuarter > ", function() {
        // Predicate: (quarter === 'Veldu') to true
        it("should set quarter to Veldu", function() {
            // Assert before the change
            expect(scope.selectedQuarter).toEqual("Veldu");

            scope.setQuarter('Veldu');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("Veldu");
            expect(location.path()).toEqual("/expenses/2014-0/0/n/n/n/n/n");
        });
        // Predicate: (quarter === 'Veldu') to false
        it("should set quarter to something else than Veldu", function() {
            // Assert before the change
            expect(scope.selectedQuarter).toEqual("Veldu");

            scope.setQuarter('Fyrsti');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("Fyrsti");
            expect(location.path()).toEqual("/expenses/2014-1/0/n/n/n/n/n");
        });

        // Predicate: (quarter === 'Fyrsti') to true
        it("should set quarter to Fyrsti", function() {
            // Assert before the change
            expect(scope.selectedQuarter).toEqual("Veldu");

            scope.setQuarter('Fyrsti');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("Fyrsti");
            expect(location.path()).toEqual("/expenses/2014-1/0/n/n/n/n/n");
        });
        // Predicate: (quarter === 'Fyrsti') to false
        it("should set quarter to something else than Fyrsti", function() {
            // Assert before the change
            expect(scope.selectedQuarter).toEqual("Veldu");

            scope.setQuarter('Annar');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("Annar");
            expect(location.path()).toEqual("/expenses/2014-2/0/n/n/n/n/n");
        });

        // Predicate: (quarter === 'Annar') to true
        it("should set quarter to Annar", function() {
            // Assert before the change
            expect(scope.selectedQuarter).toEqual("Veldu");

            scope.setQuarter('Annar');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("Annar");
            expect(location.path()).toEqual("/expenses/2014-2/0/n/n/n/n/n");
        });
        // Predicate: (quarter === 'Annar') to false
        it("should set quarter to something else than Annar", function() {
            // Assert before the change
            expect(scope.selectedQuarter).toEqual("Veldu");

            scope.setQuarter('Þriðji');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("Þriðji");
            expect(location.path()).toEqual("/expenses/2014-3/0/n/n/n/n/n");
        });

        // Predicate: (quarter === 'Þriðji') to true
        it("should set quarter to Þriðji", function() {
            // Assert before the change
            expect(scope.selectedQuarter).toEqual("Veldu");

            scope.setQuarter('Þriðji');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("Þriðji");
            expect(location.path()).toEqual("/expenses/2014-3/0/n/n/n/n/n");
        });
        // Predicate: (quarter === 'Þriðji') to false
        it("should set quarter to something else than Þriðji", function() {
            // Assert before the change
            expect(scope.selectedQuarter).toEqual("Veldu");

            scope.setQuarter('Fjórði');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("Fjórði");
            expect(location.path()).toEqual("/expenses/2014-4/0/n/n/n/n/n");
        });

        // Predicate: (quarter === 'Fjórði') to true
        it("should set quarter to Fjórði", function() {
            // Assert before the change
            expect(scope.selectedQuarter).toEqual("Veldu");

            scope.setQuarter('Fjórði');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("Fjórði");
            expect(location.path()).toEqual("/expenses/2014-4/0/n/n/n/n/n");
        });
        // Predicate: (quarter === 'Fjórði') to false
        it("should set quarter to something else than Fjórði", function() {
            // Assert before the change
            expect(scope.selectedQuarter).toEqual("Veldu");

            scope.setQuarter('Þriðji');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("Þriðji");
            expect(location.path()).toEqual("/expenses/2014-3/0/n/n/n/n/n");
        });
    });
});
