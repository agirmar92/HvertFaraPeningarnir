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

describe('Tests for timeProcessor function', () => {

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

describe('Tests for determineTypeOfFinanceKey function', () => {

    it('should return Primary', (done) => {
        const res = apinn.determineTypeOfFinanceKey('0000');
        expect(res).to.equal("Primary");
        done();
    });

    it('should also return Primary', (done) => {
        const res = apinn.determineTypeOfFinanceKey('4000');
        expect(res).to.equal("Primary");
        done();
    });

    it('should return Secondary', (done) => {
        const res = apinn.determineTypeOfFinanceKey('2100');
        expect(res).to.equal("Secondary");
        done();
    });

    it('should also return Secondary', (done) => {
        const res = apinn.determineTypeOfFinanceKey('5001');
        expect(res).to.equal("Secondary");
        done();
    });

    it('should return Secondary as well', (done) => {
        const res = apinn.determineTypeOfFinanceKey('0001');
        expect(res).to.equal("Secondary");
        done();
    });

    it('should return empty string', (done) => {
        const res = apinn.determineTypeOfFinanceKey('5011');
        expect(res).to.equal("");
        done();
    });

    it('should also return empty string', (done) => {
        const res = apinn.determineTypeOfFinanceKey('1310');
        expect(res).to.equal("");
        done();
    });

    it('should return empty string as well', (done) => {
        const res = apinn.determineTypeOfFinanceKey('0010');
        expect(res).to.equal("");
        done();
    });
});

describe('Tests for breadcrumbs labels', () => {

    var terms = '';

    it('should return Menntamál and Laun og launatengd gjöld', (done) => {
        request(apinn.api).get('/expenses/2014-0/1/3/all/all/all/1100').expect(200).end(function(err,res) {
            terms = JSON.parse(res.text);
            expect(terms.deepest[0]).to.equal('Menntamál');
            expect(terms.deepest[1]).to.equal('Laun og launatengd gjöld');
            expect(terms.labels[0].label).to.equal('Menntamál');
            expect(terms.labels[1].label).to.equal('Starfsmannakostnaður');
            expect(terms.labels[2].label).to.equal('Laun og launatengd gjöld');
            expect(terms.labels[3]).to.be.an('undefined');
            done();
        });
    });

    it('should return Kópavogsbær and Tekjur', (done) => {
        request(apinn.api).get('/expenses/2014-0/0/all/all/all/all/0000').expect(200).end(function(err,res) {
            terms = JSON.parse(res.text);
            expect(terms.deepest[0]).to.equal('Kópavogsbær');
            expect(terms.deepest[1]).to.equal('Tekjur');
            expect(terms.labels[0].label).to.equal('Tekjur');
            expect(terms.labels[1]).to.be.an('undefined');
            done();
        });
    });

    it('should return Velferðarmál and undefined', (done) => {
        request(apinn.api).get('/expenses/2014-0/1/6/all/all/all/all').expect(200).end(function(err,res) {
            terms = JSON.parse(res.text);
            expect(terms.deepest[0]).to.equal('Velferðarmál');
            expect(terms.deepest[1]).to.be.an('null');
            expect(terms.labels[0].label).to.equal('Velferðarmál');
            expect(terms.labels[1]).to.be.an('undefined');
            done();
        });
    });

    it('should return Kópavogsbær and Leigubifreiðar', (done) => {
        request(apinn.api).get('/expenses/2014-0/7/all/all/all/all/4111').expect(200).end(function(err,res) {
            terms = JSON.parse(res.text);
            expect(terms.deepest[0]).to.equal('Kópavogsbær');
            expect(terms.deepest[1]).to.equal('Leigubifreiðar');
            expect(terms.labels[0].label).to.equal('Þjónustukaup');
            expect(terms.labels[1].label).to.equal('Akstur');
            expect(terms.labels[2].label).to.equal('Leigubifreiðar');
            done();
        });
    });

    it('should return Álfhólsskóli and Kennslulaun', (done) => {
        request(apinn.api).get('/expenses/2014-0/7/3/04/042/04-222/1141').expect(200).end(function(err,res) {
            terms = JSON.parse(res.text);
            expect(terms.deepest[0]).to.equal('Álfhólsskóli');
            expect(terms.deepest[1]).to.equal('Kennslulaun');
            expect(terms.labels[3].label).to.equal('Menntamál');
            expect(terms.labels[2].label).to.equal('Fræðslumál');
            expect(terms.labels[1].label).to.equal('Grunnskólar');
            expect(terms.labels[0].label).to.equal('Álfhólsskóli');
            expect(terms.labels[4].label).to.equal('Starfsmannakostnaður');
            expect(terms.labels[5].label).to.equal('Laun og launatengd gjöld');
            expect(terms.labels[6].label).to.equal('Kennslulaun');
            done();
        });
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
        request(apinn.api).get('/expenses/2014-0/0/all/all/all/all/all').expect(200).end(function(err,res) {
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

    it('should return Kópavogsbær and undefined for deepest', (done) => {
        expect(terms.deepest[0]).to.equal('Kópavogsbær');
        expect(terms.deepest[1]).to.be.a('null');
        done();
    });

    it('should return an empty array for labels', (done) => {
        expect(terms.labels[0]).to.be.an('undefined');
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

describe('Tests for expenses, finance key pie', () => {

    var terms = '';

    before((done) => {
        request(apinn.api).get('/expenses/2014-0/6/2/05/058/05-812/9900').expect(200).end(function(err,res) {
            terms = JSON.parse(res.text);
            done();
        });
    });

    it('should give the correct amounts for the pie', (done) => {
        expect(terms.slices[0].sum_amount.value).to.equal(28338205);
        expect(terms.slices[1].sum_amount.value).to.equal(1514663);
        expect(terms.slices[2].sum_amount.value).to.equal(5200);
        done()
    });

    it('should give the correct amount for total credit', (done) => {
        expect(terms.totalCredit).to.equal(29858068);
        done();
    });

    it('should give the correct amount for total debit', (done) => {
        expect(terms.totalDebit).to.equal(12950574);
        done();
    });

    it('should return Lista og menningarráð and Aðrir styrkir og framlög for deepest', (done) => {
        expect(terms.deepest[0]).to.equal('Lista og menningarráð');
        expect(terms.deepest[1]).to.equal('Aðrir styrkir og framlög');
        done();
    });

    it('should return an empty array for labels', (done) => {
        expect(terms.labels[0].label).to.equal('Lista og menningarráð');
        expect(terms.labels[1].label).to.equal('Ýmsir styrkir og framlög');
        expect(terms.labels[2].label).to.equal('Menningarmál');
        expect(terms.labels[3].label).to.equal('Menningarmál');
        expect(terms.labels[4].label).to.equal('Styrkir og framlög');
        expect(terms.labels[5].label).to.equal('Aðrir styrkir og framlög');
        expect(terms.labels[6]).to.be.an('undefined');
        done();
    });
});

describe('Tests for expenses, secondary finance key pie', () => {

    var terms = '';

    before((done) => {
        request(apinn.api).get('/expenses/2014-0/6/6/02/024/02-426/2900').expect(200).end(function(err,res) {
            terms = JSON.parse(res.text);
            done();
        });
    });

    it('should give the correct amounts for the pie', (done) => {
        expect(terms.slices[0].sum_amount.value).to.equal(2380891);
        expect(terms.slices[1].sum_amount.value).to.equal(642563);
        expect(terms.slices[2].sum_amount.value).to.equal(453585);
        expect(terms.slices[3].sum_amount.value).to.equal(98801);
        expect(terms.slices[4].sum_amount.value).to.equal(1381);
        done()
    });

    it('should give the correct amount for total credit', (done) => {
        expect(terms.totalCredit).to.equal(3577221);
        done();
    });

    it('should give the correct amount for total debit', (done) => {
        expect(terms.totalDebit).to.equal(31980);
        done();
    });

    it('should return Sambýli heilab. Roðasölum 1 and Önnur vörukaup for deepest', (done) => {
        expect(terms.deepest[0]).to.equal('Sambýli heilab. Roðasölum 1');
        expect(terms.deepest[1]).to.equal('Önnur vörukaup');
        done();
    });

    it('should return the correct array for labels', (done) => {
        expect(terms.labels[0].label).to.equal('Sambýli heilab. Roðasölum 1');
        expect(terms.labels[1].label).to.equal('Þjónusta við aldraða');
        expect(terms.labels[2].label).to.equal('Félagsþjónusta');
        expect(terms.labels[3].label).to.equal('Velferðarmál');
        expect(terms.labels[4].label).to.equal('Vörukaup');
        expect(terms.labels[5].label).to.equal('Önnur vörukaup');
        expect(terms.labels[6]).to.be.an('undefined');
        done();
    });
});

describe('Tests for expenses, primary finance key pie', () => {

    var terms = '';

    before((done) => {
        request(apinn.api).get('/expenses/2014-0/5/3/04/042/04-222/2000').expect(200).end(function(err,res) {
            terms = JSON.parse(res.text);
            done();
        });
    });

    it('should give the correct amounts for the pie', (done) => {
        expect(terms.slices[0].sum_amount.value).to.equal(31494882);
        expect(terms.slices[1].sum_amount.value).to.equal(15165738);
        expect(terms.slices[2].sum_amount.value).to.equal(7660118);
        expect(terms.slices[3].sum_amount.value).to.equal(6702436);
        expect(terms.slices[4].sum_amount.value).to.equal(3010917);
        done()
    });

    it('should give the correct amount for total credit', (done) => {
        expect(terms.totalCredit).to.equal(64034091);
        done();
    });

    it('should give the correct amount for total debit', (done) => {
        expect(terms.totalDebit).to.equal(1388895);
        done();
    });

    it('should return Álfhólsskóli and Vörukaup for deepest', (done) => {
        expect(terms.deepest[0]).to.equal('Álfhólsskóli');
        expect(terms.deepest[1]).to.equal('Vörukaup');
        done();
    });

    it('should return the correct array for labels', (done) => {
        expect(terms.labels[0].label).to.equal('Álfhólsskóli');
        expect(terms.labels[1].label).to.equal('Grunnskólar');
        expect(terms.labels[2].label).to.equal('Fræðslumál');
        expect(terms.labels[3].label).to.equal('Menntamál');
        expect(terms.labels[4].label).to.equal('Vörukaup');
        expect(terms.labels[6]).to.be.an('undefined');
        done();
    });
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
        request(apinn.api).get('/joint-revenue/2014-0/3/all/all/').expect(200).end(function(err,res) {
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

    it('should return Kópavogbær and undefined for deepest', (done) => {
        expect(terms.deepest[0]).to.equal('Kópavogsbær');
        expect(terms.deepest[1]).to.be.a('null');
        done();
    });

    it('should return an empty array for labels', (done) => {
        expect(terms.labels[0]).to.be.an('undefined');
        done();
    });
});

describe('Tests for joint revenues, primary finance key pie', () => {

    var terms = '';

    before((done) => {
        request(apinn.api).get('/joint-revenue/2014-0/5/00-011/0000/').expect(200).end(function(err,res) {
            terms = JSON.parse(res.text);
            done();
        });
    });

    it('should give the correct amounts for the pie', (done) => {
        expect(terms.slices[0].sum_amount.value).to.equal(14862934701);
        done();
    });

    it('should give the correct amount for total debit', (done) => {
        expect(terms.totalDebit).to.equal(14862934701);
        done();
    });

    it('should give the correct amount for total credit', (done) => {
        expect(terms.totalCredit).to.equal(395892638);
        done();
    });

    it('should return Útsvar and Tekjur for deepest', (done) => {
        expect(terms.deepest[0]).to.equal('Útsvar');
        expect(terms.deepest[1]).to.equal('Tekjur');
        done();
    });

    it('should return the correct array for labels', (done) => {
        expect(terms.labels[0].label).to.equal('Útsvar');
        expect(terms.labels[1].label).to.equal('Tekjur');
        expect(terms.labels[2]).to.be.an('undefined');
        done();
    });
});

describe('Tests for joint revenues, secondary finance key pie', () => {

    var terms = '';

    before((done) => {
        request(apinn.api).get('/joint-revenue/2014-0/6/00-335/0300/').expect(200).end(function(err,res) {
            terms = JSON.parse(res.text);
            done();
        });
    });

    it('should give the correct amounts for the pie', (done) => {
        expect(terms.slices[0].sum_amount.value).to.equal(385935501);
        done();
    });

    it('should give the correct amount for total debit', (done) => {
        expect(terms.totalDebit).to.equal(385935501);
        done();
    });

    it('should give the correct amount for total credit', (done) => {
        expect(terms.totalCredit).to.equal(0);
        done();
    });

    it('should return Lóðarleiga and Arður af eignum for deepest', (done) => {
        expect(terms.deepest[0]).to.equal('Lóðarleiga');
        expect(terms.deepest[1]).to.equal('Arður af eignum');
        done();
    });

    it('should return the correct array for labels', (done) => {
        expect(terms.labels[0].label).to.equal('Lóðarleiga');
        expect(terms.labels[1].label).to.equal('Tekjur');
        expect(terms.labels[2].label).to.equal('Arður af eignum');
        expect(terms.labels[3]).to.be.an('undefined');
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
        request(apinn.api).get('/special-revenue/2014-0/0/all/all/all/all/all').expect(200).end(function(err,res) {
            terms = JSON.parse(res.text);
            done();
        });
    });

    it('should give the correct amounts for the pie', (done) => {
        expect(terms.slices[0].sum_amount.value).to.equal(4597321188);
        expect(terms.slices[1].sum_amount.value).to.equal(2735820712);
        expect(terms.slices[2].sum_amount.value).to.equal(1965187278);
        expect(terms.slices[3].sum_amount.value).to.equal(1326543110);
        expect(terms.slices[4].sum_amount.value).to.equal(298774369);
        expect(terms.slices[5].sum_amount.value).to.equal(165640878);
        done();
    });

    it('should give the correct amount for total debit', (done) => {
        expect(terms.totalCredit).to.equal(28374242);
        done();
    });

    it('should give the correct amount for total credit', (done) => {
        expect(terms.totalDebit).to.equal(11089287535);
        done();
    });

    it('should return Kópavogsbær and null for deepest', (done) => {
        expect(terms.deepest[0]).to.equal('Kópavogsbær');
        expect(terms.deepest[1]).to.be.a('null');
        done();
    });

    it('should return the correct array for labels', (done) => {
        expect(terms.labels[0]).to.be.an('undefined');
        done();
    });
});

describe('Tests for special revenues, primary finance key pie', () => {

    var terms = '';

    before((done) => {
        request(apinn.api).get('/special-revenue/2014-0/5/3/04/041/04-115/0000').expect(200).end(function(err,res) {
            terms = JSON.parse(res.text);
            done();
        });
    });

    it('should give the correct amounts for the pie', (done) => {
        expect(terms.slices[0].sum_amount.value).to.equal(34376055);
        done();
    });

    it('should give the correct amount for total debit', (done) => {
        expect(terms.totalCredit).to.equal(0);
        done();
    });

    it('should give the correct amount for total credit', (done) => {
        expect(terms.totalDebit).to.equal(34376055);
        done();
    });

    it('should return Kópavogsbær and null for deepest', (done) => {
        expect(terms.deepest[0]).to.equal('Leikskólinn Núpur');
        expect(terms.deepest[1]).to.equal('Tekjur');
        done();
    });

    it('should return the correct array for labels', (done) => {
        expect(terms.labels[0].label).to.equal('Leikskólinn Núpur');
        expect(terms.labels[1].label).to.equal('Leikskólar og dagvistun');
        expect(terms.labels[2].label).to.equal('Fræðslumál');
        expect(terms.labels[3].label).to.equal('Menntamál');
        expect(terms.labels[4].label).to.equal('Tekjur');
        expect(terms.labels[5]).to.be.an('undefined');
        done();
    });
});

describe('Tests for special revenues, secondary finance key pie', () => {

    var terms = '';

    before((done) => {
        request(apinn.api).get('/special-revenue/2014-0/6/7/21/214/21-420/0700').expect(200).end(function(err,res) {
            terms = JSON.parse(res.text);
            done();
        });
    });

    it('should give the correct amounts for the pie', (done) => {
        expect(terms.slices[0].sum_amount.value).to.equal(244222440);
        done();
    });

    it('should give the correct amount for total debit', (done) => {
        expect(terms.totalCredit).to.equal(0);
        done();
    });

    it('should give the correct amount for total credit', (done) => {
        expect(terms.totalDebit).to.equal(244222440);
        done();
    });

    it('should return Tölvudeild and Vörur og þjónusta til eigin nota for deepest', (done) => {
        expect(terms.deepest[0]).to.equal('Tölvudeild');
        expect(terms.deepest[1]).to.equal('Vörur og þjónusta til eigin nota');
        done();
    });

    it('should return the correct array for labels', (done) => {
        expect(terms.labels[0].label).to.equal('Tölvudeild');
        expect(terms.labels[1].label).to.equal('Skrifstofur sveitarfélagsins');
        expect(terms.labels[2].label).to.equal('Sameiginlegur kostnaður');
        expect(terms.labels[3].label).to.equal('Önnur mál');
        expect(terms.labels[4].label).to.equal('Tekjur');
        expect(terms.labels[5].label).to.equal('Vörur og þjónusta til eigin nota');
        expect(terms.labels[6]).to.be.an('undefined');
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
