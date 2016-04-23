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

        /* Predicate: (YEARS.indexOf(year) !== -1) to false
        it("should set year to something invalid", function() {
            // Assert before the change
            expect(scope.selectedYear).toEqual('2014');
            scope.setYear('derka');
            // Assert after the change
            expect(scope.selectedYear).toEqual('2014');
        });*/
    });

    /*
    *       Test suite for function setMonth(month)
    * */
    describe("setMonth > ", function() {
        // Predicate: (i < 10 && i !== 0) to true
        it("should set month to February", function() {
            // Assert before the change
            expect(scope.selectedMonth).toEqual("veldu");

            scope.setMonth(2);
            // Assert after the change
            expect(scope.selectedMonth).toEqual("febrúar");
            expect(location.path()).toEqual("/expenses/2014-02/0/n/n/n/n/n");
        });
        // Predicate: (i < 10 && i !== 0) to false
        it("should set month to December", function() {
            // Assert before the change
            expect(scope.selectedMonth).toEqual("veldu");
            scope.setMonth(12);
            // Assert after the change
            expect(scope.selectedMonth).toEqual("desember");
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
            expect(scope.selectedQuarter).toEqual("veldu");

            scope.setQuarter('veldu');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("veldu");
            expect(location.path()).toEqual("/expenses/2014-0/0/n/n/n/n/n");
        });
        // Predicate: (quarter === 'Veldu') to false
        it("should set quarter to something else than Veldu", function() {
            // Assert before the change
            expect(scope.selectedQuarter).toEqual("veldu");

            scope.setQuarter('fyrsti');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("fyrsti");
            expect(location.path()).toEqual("/expenses/2014-1/0/n/n/n/n/n");
        });

        // Predicate: (quarter === 'Fyrsti') to true
        it("should set quarter to Fyrsti", function() {
            // Assert before the change
            expect(scope.selectedQuarter).toEqual("veldu");

            scope.setQuarter('fyrsti');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("fyrsti");
            expect(location.path()).toEqual("/expenses/2014-1/0/n/n/n/n/n");
        });
        // Predicate: (quarter === 'Fyrsti') to false
        it("should set quarter to something else than Fyrsti", function() {
            // Assert before the change
            expect(scope.selectedQuarter).toEqual("veldu");

            scope.setQuarter('annar');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("annar");
            expect(location.path()).toEqual("/expenses/2014-2/0/n/n/n/n/n");
        });

        // Predicate: (quarter === 'Annar') to true
        it("should set quarter to Annar", function() {
            // Assert before the change
            expect(scope.selectedQuarter).toEqual("veldu");

            scope.setQuarter('annar');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("annar");
            expect(location.path()).toEqual("/expenses/2014-2/0/n/n/n/n/n");
        });
        // Predicate: (quarter === 'Annar') to false
        it("should set quarter to something else than Annar", function() {
            // Assert before the change
            expect(scope.selectedQuarter).toEqual("veldu");

            scope.setQuarter('þriðji');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("þriðji");
            expect(location.path()).toEqual("/expenses/2014-3/0/n/n/n/n/n");
        });

        // Predicate: (quarter === 'Þriðji') to true
        it("should set quarter to Þriðji", function() {
            // Assert before the change
            expect(scope.selectedQuarter).toEqual("veldu");

            scope.setQuarter('þriðji');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("þriðji");
            expect(location.path()).toEqual("/expenses/2014-3/0/n/n/n/n/n");
        });
        // Predicate: (quarter === 'Þriðji') to false
        it("should set quarter to something else than Þriðji", function() {
            // Assert before the change
            expect(scope.selectedQuarter).toEqual("veldu");

            scope.setQuarter('fjórði');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("fjórði");
            expect(location.path()).toEqual("/expenses/2014-4/0/n/n/n/n/n");
        });

        // Predicate: (quarter === 'Fjórði') to true
        it("should set quarter to Fjórði", function() {
            // Assert before the change
            expect(scope.selectedQuarter).toEqual("veldu");

            scope.setQuarter('fjórði');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("fjórði");
            expect(location.path()).toEqual("/expenses/2014-4/0/n/n/n/n/n");
        });
        // Predicate: (quarter === 'Fjórði') to false
        it("should set quarter to something else than fjórði", function() {
            // Assert before the change
            expect(scope.selectedQuarter).toEqual("veldu");

            scope.setQuarter('þriðji');
            // Assert after the change
            expect(scope.selectedQuarter).toEqual("þriðji");
            expect(location.path()).toEqual("/expenses/2014-3/0/n/n/n/n/n");
        });
    });
});
