'use strict';

// Modules
const request = require("supertest");
const expect = require('chai').expect;
const cheerio = require("cheerio");
const rewire = require('rewire');
const apinn = require('../api');

const url ="http://hfp.northeurope.cloudapp.azure.com";
const apiUrl = "http://localhost:4000";

/*  Predicate coverage  */

describe('Tests for TimeProcessor function', () => {

    it('should return the whole year', (done) => {
        const res = apinn.timeProcessor('2014-0');
        expect(res.from).to.equal('2014-01');
        expect(res.to).to.equal('2014-13');
        done();
    });

    it('should return the first quarter', (done) => {
        const res = apinn.timeProcessor('2014-1');
        expect(res.from).to.equal('2014-01');
        expect(res.to).to.equal('2014-04');
        done();
    });

    it('should return the second quarter', (done) => {
        const res = apinn.timeProcessor('2014-2');
        expect(res.from).to.equal('2014-04');
        expect(res.to).to.equal('2014-07');
        done();
    });

    it('should return the third quarter', (done) => {
        const res = apinn.timeProcessor('2014-3');
        expect(res.from).to.equal('2014-07');
        expect(res.to).to.equal('2014-10');
        done();
    });

    it('should return the fourth quarter', (done) => {
        const res = apinn.timeProcessor('2014-4');
        expect(res.from).to.equal('2014-10');
        expect(res.to).to.equal('2014-13');
        done();
    });

    it('should return invalid input quarter', (done) => {
        const res = apinn.timeProcessor('2014-5');
        expect(res).to.equal('invalid input');
        done();
    });

    it('should return january', (done) => {
        const res = apinn.timeProcessor('2014-01');
        expect(res.from).to.equal('2014-01');
        expect(res.to).to.equal('2014-02');
        done();
    });

    it('should return july', (done) => {
        const res = apinn.timeProcessor('2014-07');
        expect(res.from).to.equal('2014-07');
        expect(res.to).to.equal('2014-08');
        done();
    });

    it('should return december', (done) => {
        const res = apinn.timeProcessor('2014-12');
        expect(res.from).to.equal('2014-12');
        expect(res.to).to.equal('2014-13');
        done();
    });

    it('should return september', (done) => {
        const res = apinn.timeProcessor('2014-09');
        expect(res.from).to.equal('2014-09');
        expect(res.to).to.equal('2014-10');
        done();
    });

    it('should return invalid input, month', (done) => {
        const res = apinn.timeProcessor('2014-13');
        expect(res).to.equal('invalid input');
        done();
    });

    it('should return invalid input, too long', (done) => {
        const res = apinn.timeProcessor('2014-134');
        expect(res).to.equal('invalid input');
        done();
    });

    it('should return invalid input, too short', (done) => {
        const res = apinn.timeProcessor('2014-');
        expect(res).to.equal('invalid input');
        done();
    });

    it('should return invalid input, empty', (done) => {
        const res = apinn.timeProcessor('');
        expect(res).to.equal('invalid input');
        done();
    });

    it('should return invalid input, rediculous', (done) => {
        const res = apinn.timeProcessor('aælskdjhfæjsdf lækjsdh \n lædkhjf');
        expect(res).to.equal('invalid input');
        done();
    });
});

/*
 *   These tests compares the results from calling the API to this SQL query for kop-lind:
 *   SELECT SUM([Upphæð]), [Yfirmálaflokkur]
 *   FROM [DW].[HvertFaraPeningarnir]
 *   WHERE [Yfirmálaflokkur] != '4-Tekjur'
 *   AND [Upphæð] > 0
 *   GROUP BY [Yfirmálaflokkur]
 */
describe('Tests for expenses default pie', () => {

    var terms = '';

    before((done) => {
        request(apiUrl).get('/expenses/2014-0/0/all/all/all/all/all').expect(200).end(function(err,res) {
            terms = JSON.parse(res.text);
            done();
        });
    });

    it('should give the correct amounts for the pie', (done) => {
        expect(terms.slices[0].sum_amount.value).to.equal(15680879962);
        expect(terms.slices[1].sum_amount.value).to.equal(8734423653);
        expect(terms.slices[2].sum_amount.value).to.equal(3156000085);
        expect(terms.slices[3].sum_amount.value).to.equal(2989462505);
        expect(terms.slices[4].sum_amount.value).to.equal(648354559);
        expect(terms.slices[5].sum_amount.value).to.equal(588394000);
        expect(terms.slices[6].sum_amount.value).to.equal(524031170);
        done()
    });

    it('should give the correct amount for total credit', (done) => {
        expect(terms.totalCredit).to.equal(32321545934);
        done();
    });

    it('should give the correct amount for total debit', (done) => {
        expect(terms.totalDebit).to.equal(14922044086);
        done();
    });

    // http://hfp.northeurope.cloudapp.azure.com/#/expenses/2014-0/1/3/n/n/n/n
    /*
     it('GET amount in first slice (LAYER 1 - Menntamál)', (done) => {
     request(apiUrl).get('/expenses/2014-0/1/3/all/all/all/all').expect(200).end(function(err, res) {
     var terms = JSON.parse(res.text);
     // Fræðslumál
     var check = terms.slices[0].sum_amount.value;
     expect(check).to.equal(11644921719);
     done();
     });
     });

     it('GET amount in second slice (LAYER 1 - Menntamál)', (done) => {
     request(apiUrl).get('/expenses/2014-0/1/3/all/all/all/all').expect(200).end(function(err, res) {
     var terms = JSON.parse(res.text);
     // Æskulýðs- og íþróttamál
     var check = terms.slices[1].sum_amount.value;
     expect(check).to.equal(3966219349);
     done();
     });
     });

     it('GET amount in third slice (LAYER 1 - Menntamál)', (done) => {
     request(apiUrl).get('/expenses/2014-0/1/3/all/all/all/all').expect(200).end(function(err, res) {
     var terms = JSON.parse(res.text);
     // Byggingarsjóður MK
     var check = terms.slices[2].sum_amount.value;
     expect(check).to.equal(69738894);
     done();
     });
     });
     */
});

/*
 *   These tests compares the results from calling the API to this SQL query for kop-lind:
 *   SELECT SUM([Upphæð]), [Málaflokkur-deild]
 *   FROM [DW].[HvertFaraPeningarnir]
 *   WHERE [Málaflokkur] = '00-Tekjur'
 *   AND [Upphæð] < 0
 *   GROUP BY [Málaflokkur-deild]
 */
describe('Tests for joint revenues default pie', () => {

    var terms = '';

    before((done) => {
        request(apiUrl).get('/joint-revenue/2014-0/3/all/all/').expect(200).end(function(err,res) {
            terms = JSON.parse(res.text);
            done();
        });
    });

    it('should give the correct amounts for the pie', (done) => {
        expect(terms.slices[0].sum_amount.value).to.equal(14862934701);
        expect(terms.slices[1].sum_amount.value).to.equal(2794596142);
        expect(terms.slices[2].sum_amount.value).to.equal(485659631);
        expect(terms.slices[3].sum_amount.value).to.equal(385935501);
        done();
    });

    it('should give the correct amount for total debit', (done) => {
        expect(terms.totalDebit).to.equal(18529125975);
        done();
    });

    it('should give the correct amount for total credit', (done) => {
        expect(terms.totalCredit).to.equal(469219433);
        done();
    });
});

/*
*   These tests compares the results from calling the API to this SQL query for kop-lind:
*   SELECT SUM([Upphæð]), [Yfirmálaflokkur]
*   FROM [DW].[HvertFaraPeningarnir]
*   WHERE [Yfirfjárhagslykill] = '0000-Tekjur'
*   AND [Yfirmálaflokkur] != '4-Tekjur'
*   AND [Upphæð] < 0
*   GROUP BY [Yfirmálaflokkur]
*/
describe('Tests for special revenues default pie', () => {

    var terms = '';

    before((done) => {
        request(apiUrl).get('/special-revenue/2014-0/0/all/all/all/all/all').expect(200).end(function(err,res) {
            terms = JSON.parse(res.text);
            done();
        });
    });

    it('should give the correct amounts for the pie', (done) => {
        expect(terms.slices[5].sum_amount.value).to.equal(4597321188);
        expect(terms.slices[4].sum_amount.value).to.equal(2735820712);
        expect(terms.slices[3].sum_amount.value).to.equal(1965187278);
        expect(terms.slices[2].sum_amount.value).to.equal(1326543110);
        expect(terms.slices[1].sum_amount.value).to.equal(298774369);
        expect(terms.slices[0].sum_amount.value).to.equal(165640878);
        done();
    });

    it('should give the correct amount for total debit', (done) => {
        expect(terms.totalCredit).to.equal(11089287535);
        done();
    });

    it('should give the correct amount for total credit', (done) => {
        expect(terms.totalDebit).to.equal(28374242);
        done();
    });
});





/*
describe("Hvert fara  peningarnir", () => {


    it("Test 1", () => {
        var results = request(apiUrl).get('/expenses/2014-0/0/all/all/all/all/all');
        console.log(results.slices[0]);
        expect(results.slices.length()).to.equal(7);
    });

    it("GETS Default page", (done) => {

        //var results = request(apiUrl).get('/expenses/2014-0/0/all/all/all/all/all');
        request(apiUrl).get('/expenses/2014-0/0/all/all/all/all/all').expect(200).end(function(err, res) {
            var terms = JSON.parse(res.text);
            console.log("Length of slices: ", terms.slices.length);
            var check = terms.slices[6].sum_amount.value;
            expect(check).to.deep.equal(524031170);
            done();
        });
    });


    // These are just basic tests for client with its current definition of the URL - 27.03.2016
    /*
    it("GETS Default page", (done) => {
        request(url).get('/#/expenses/2014-0/').expect(200).end(done);
    });

    it("GETS Default page", function(res) {
        var results = request(url).get('/#/expenses/2014-0/');
        request(url).get('/#/expenses/2014-0/').expect(res.slices);
    });


    it("GETS Default page", (done) => {
        request(api.doc.slices).get('/#/expenses/2014-0/').expect(200).end(done);
    });

    it('GETS Another page', (done) => {
        request(url).get('/').expect(200).end(done);
    });

    it('GETS 1.Layer', (done) => {
        request(url).get('#/expenses').expect(200).end(done);
    });

    it('GETS 1.Layer', (done) => {
        request(url).get('#/expenses/2014-0').expect(200).end(done);
    });

    it('GETS 2.Layer', (done) => {
        request(url).get('#/expenses/2014-0/3').expect(200).end(done);
    });

    it('GETS 2.Layer', (done) => {
        request(url).get('#/expenses/2014-0/1/3/').expect(200).end(done);
    });

    it('GETS 3.Layer', (done) => {
        request(url).get('#/expenses/2014-0/2/3/04').expect(200).end(done);
    });

    it('GETS 4.Layer', (done) => {
        request(url).get('#/expenses/2014-0/3/3/04/049').expect(200).end(done);
    });

    it('GETS 5.Layer', (done) => {
        request(url).get('#/expenses/2014-0/4/3/04/049/04-222').expect(200).end(done);
    });

    it('GETS 6.Layer', (done) => {
        request(url).get('#/expenses/2014-0/5/3/04/049/04-222/1000').expect(200).end(done);
    });

    it('GETS 6.Layer', (done) => {
        request(url).get('#/expenses/2014-0/5/3/04/049/04-222/1000').expect(200).end(done);
    });

    it('GETS 7.Layer', (done) => {
        request(url).get('#/expenses/2014-0/6/3/04/049/04-222/1100').expect(200).end(done);
    });

    it('GETS 8.Layer', (done) => {
        request(url).get('#/expenses/2014-0/7/3/04/049/04-222/1141').expect(200).end(done);
    });

});*/
