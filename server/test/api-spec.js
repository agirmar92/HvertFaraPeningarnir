var request = require("supertest");
//var request    = require('request');
var expect = require('chai').expect;
var cheerio = require("cheerio");
var rewire = require('rewire');
var api = rewire('../api');

var url ="http://hfp.northeurope.cloudapp.azure.com";
var apiUrl = "http://localhost:4000";


describe('Testing all of 2014', function() {

    it('GET amount in first slice (Layer 0)', function(done) {
        //var results = request(apiUrl).get('/expenses/2014-0/0/all/all/all/all/all');
        //console.log(results);
        //expect(results.slices.totalCredit).to.equal(32321545934);
        //expect(true).to.equal(true);

        request(apiUrl).get('/expenses/2014-0/0/all/all/all/all/all').expect(200).end(function(err, res) {
            var terms = JSON.parse(res.text);
            var check = terms.slices[0].sum_amount.value;
            // var $ = cheerio.load(res.text);
            // var sliver = $("");
            expect(check).to.equal(15680879962);
            done();
        });
    });

    it('GET amount in second slice (Layer 0)', function(done) {
        request(apiUrl).get('/expenses/2014-0/0/all/all/all/all/all').expect(200).end(function(err, res) {
            var terms = JSON.parse(res.text);
            // Önnur mál
            var check = terms.slices[1].sum_amount.value;
            expect(check).to.equal(8734423653);
            done();
        });
    });

    it('GET amount in third slice (Layer 0)', function(done) {
        request(apiUrl).get('/expenses/2014-0/0/all/all/all/all/all').expect(200).end(function(err, res) {
            var terms = JSON.parse(res.text);
            // Velferðarmál
            var check = terms.slices[2].sum_amount.value;
            expect(check).to.equal(3156000085);
            done();
        });
    });

    it('GET amount in fourth slice (Layer 0)', function(done) {
        request(apiUrl).get('/expenses/2014-0/0/all/all/all/all/all').expect(200).end(function(err, res) {
            var terms = JSON.parse(res.text);
            // Umhverfismál
            var check = terms.slices[3].sum_amount.value;
            expect(check).to.equal(2989462505);
            done();
        });
    });

    it('GET amount in fifth slice (Layer 0)', function(done) {
        request(apiUrl).get('/expenses/2014-0/0/all/all/all/all/all').expect(200).end(function(err, res) {
            var terms = JSON.parse(res.text);
            // Menningarmál
            var check = terms.slices[4].sum_amount.value;
            expect(check).to.equal(648354559);
            done();
        });
    });

    it('GET amount in sixth slice (Layer 0)', function(done) {
        request(apiUrl).get('/expenses/2014-0/0/all/all/all/all/all').expect(200).end(function(err, res) {
            var terms = JSON.parse(res.text);
            // Lífeyrissjóðsmál
            var check = terms.slices[5].sum_amount.value;
            expect(check).to.equal(588394000);
            done();
        });
    });

    it('GET amount in seventh slice (Layer 0)', function(done) {
        request(apiUrl).get('/expenses/2014-0/0/all/all/all/all/all').expect(200).end(function(err, res) {
            var terms = JSON.parse(res.text);
            // Öryggismál
            var check = terms.slices[6].sum_amount.value;
            expect(check).to.equal(524031170);
            done();
        });
    });

    it('GET totalCredit for the default home page (Layer 0)', function(done) {
        request(apiUrl).get('/expenses/2014-0/0/all/all/all/all/all').expect(200).end(function(err, res) {
            var terms = JSON.parse(res.text);
            var check = terms.totalCredit;
            expect(check).to.equal(32321545934);
            done();
        });
    });

    it('GET totalDebit for the default home page (Layer 0)', function(done) {
        request(apiUrl).get('/expenses/2014-0/0/all/all/all/all/all').expect(200).end(function(err, res) {
            var terms = JSON.parse(res.text);
            var check = terms.totalDebit;
            expect(check).to.equal(14922044086);
            done();
        });
    });

    // http://hfp.northeurope.cloudapp.azure.com/#/expenses/2014-0/1/3/n/n/n/n

    it('GET amount in first slice (LAYER 1 - Menntamál)', function(done) {
        request(apiUrl).get('/expenses/2014-0/1/3/all/all/all/all').expect(200).end(function(err, res) {
            var terms = JSON.parse(res.text);
            // Fræðslumál
            var check = terms.slices[0].sum_amount.value;
            expect(check).to.equal(11644921719);
            done();
        });
    });

    it('GET amount in second slice (LAYER 1 - Menntamál)', function(done) {
        request(apiUrl).get('/expenses/2014-0/1/3/all/all/all/all').expect(200).end(function(err, res) {
            var terms = JSON.parse(res.text);
            // Æskulýðs- og íþróttamál
            var check = terms.slices[1].sum_amount.value;
            expect(check).to.equal(3966219349);
            done();
        });
    });

    it('GET amount in third slice (LAYER 1 - Menntamál)', function(done) {
        request(apiUrl).get('/expenses/2014-0/1/3/all/all/all/all').expect(200).end(function(err, res) {
            var terms = JSON.parse(res.text);
            // Byggingarsjóður MK
            var check = terms.slices[2].sum_amount.value;
            expect(check).to.equal(69738894);
            done();
        });
    });

});




describe("Hvert fara  peningarnir", function() {

    /*
    it("Test 1", function() {
        var results = request(apiUrl).get('/expenses/2014-0/0/all/all/all/all/all');
        console.log(results.slices[0]);
        expect(results.slices.length()).to.equal(7);
    });
    */
    it("GETS Default page", function(done) {

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
    it("GETS Default page", function(done) {
        request(url).get('/#/expenses/2014-0/').expect(200).end(done);
    });

    it("GETS Default page", function(res) {
        var results = request(url).get('/#/expenses/2014-0/');
        request(url).get('/#/expenses/2014-0/').expect(res.slices);
    });


    it("GETS Default page", function(done) {
        request(api.doc.slices).get('/#/expenses/2014-0/').expect(200).end(done);
    });

    it('GETS Another page', function(done) {
        request(url).get('/').expect(200).end(done);
    });

    it('GETS 1.Layer', function(done) {
        request(url).get('#/expenses').expect(200).end(done);
    });

    it('GETS 1.Layer', function(done) {
        request(url).get('#/expenses/2014-0').expect(200).end(done);
    });

    it('GETS 2.Layer', function(done) {
        request(url).get('#/expenses/2014-0/3').expect(200).end(done);
    });

    it('GETS 2.Layer', function(done) {
        request(url).get('#/expenses/2014-0/1/3/').expect(200).end(done);
    });

    it('GETS 3.Layer', function(done) {
        request(url).get('#/expenses/2014-0/2/3/04').expect(200).end(done);
    });

    it('GETS 4.Layer', function(done) {
        request(url).get('#/expenses/2014-0/3/3/04/049').expect(200).end(done);
    });

    it('GETS 5.Layer', function(done) {
        request(url).get('#/expenses/2014-0/4/3/04/049/04-222').expect(200).end(done);
    });

    it('GETS 6.Layer', function(done) {
        request(url).get('#/expenses/2014-0/5/3/04/049/04-222/1000').expect(200).end(done);
    });

    it('GETS 6.Layer', function(done) {
        request(url).get('#/expenses/2014-0/5/3/04/049/04-222/1000').expect(200).end(done);
    });

    it('GETS 7.Layer', function(done) {
        request(url).get('#/expenses/2014-0/6/3/04/049/04-222/1100').expect(200).end(done);
    });

    it('GETS 8.Layer', function(done) {
        request(url).get('#/expenses/2014-0/7/3/04/049/04-222/1141').expect(200).end(done);
    });
    */
});
