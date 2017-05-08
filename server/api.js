'use strict';

// Modules
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const elasticsearch = require('elasticsearch');

const Firebase = require("firebase");
const hfpFirebaseRef = new Firebase("https://hfpnew.firebaseio.com/");
const jenkinsUpdateJob = "http://hfp.northeurope.cloudapp.azure.com:8080/job/NotifyAdmin/buildWithParameters?";

// Globals
const api = express();
const elasticClient = new elasticsearch.Client({
    host: 'http://hfp.northeurope.cloudapp.azure.com:9200'
});
const aggs = [ "AffairGroup", "Affair", "DepartmentGroup", "Department", "PrimaryFinanceKey", "SecondaryFinanceKey", "FinanceKey", "CreditorID" ];
api.use(bodyParser.json());

const timeProcessor = (period) => {
    let year = period.substring(0,5);
    let from = '';
    let to = '';
    if (period.length === 6) {
        if (period.charAt(5) === '0') {
            // whole year
            from = year + '01';
            to = year + '13';
        } else if (period.charAt(5) === '1') {
            // quarters
            from = year + '01';
            to = year + '04';
        } else if (period.charAt(5) === '2') {
            from = year + '04';
            to = year + '07';
        } else if (period.charAt(5) === '3') {
            from = year + '07';
            to = year + '10';
        } else if (period.charAt(5) === '4') {
            from = year + '10';
            to = year + '13';
        } else {
            return 'invalid input';
        }
    } else if (period.length !== 7) {
        return 'invalid input';
    } else {
        // months
        let month = parseInt(period.substring(5,7), 10);
        if (month < 9) {
            from = year + '0' + month;
            to = year + '0' + (month + 1);
        } else if (month === 9) {
            from = year + '0' + month;
            to = year + (month + 1);
        } else if (month > 12) {
            return "invalid input";
        } else {
            from = year + month;
            to = year + (month + 1);
        }
    }
    return { "from": from, "to": to };
};

const determineTypeOfFinanceKey = (key) => {
    if (key !== 'all') {
        if (key.substring(key.length - 3, key.length) === '000') {
            return "Primary";
        } else if (key.substring(key.length - 2, key.length) === '00' || key.substring(1,3) == '00') {
            return "Secondary";
        } else {
            return "";
        }
    }
    return "Invalid Input";
};

/*
*       POST route that authenticates the user with a token.
*       If authenticated, a response will be sent to Jenkins to update data for the given period.
*
*       The route expects three parameters from request payload = {
*           year: Indicates the year to update <Year>,
*           token: Token used to authenticate the user <String>,
*           email: The user's email address <String>
*       }
*
*       Returns an object = {
*           updateUnderway: Indicates whether the update is underway <Bool>,
*           authSuccess: Indicates whether the authentication was successful or not <Bool>,
*           msg: Text explaining the results <String>
*       }
* */
api.post('/updateDatabase', (req, res) => {
    const year      = req.body.year;
    const token     = req.body.token;
    const email     = req.body.email;

    const requestURL = jenkinsUpdateJob + 'userEmail=' + email + '&year=' + year + '&token=fetch';

    // Initializing the object returned
    let responseObject = {
        updateUnderway: false,
        authSuccess: false,
        msg: ""
    };

    // Authenticate the user with the given token
    hfpFirebaseRef.authWithCustomToken(token, (error, authData) => {
        if (error) {
            // Authentication failed, cancel update
            responseObject.msg = "Authentication failed";
            res.status(500).send(responseObject);
        } else {
            // Authentication succeeded
            responseObject.authSuccess = true;

            request.get(
                requestURL,
                (error, response) => {
                    responseObject.updateUnderway = true;
                    responseObject.msg = "All good";
                    res.status(202).send(responseObject);
                }
            );
        }
    });
});

/*
    This route will return an object containing 4 things:
    - a bucket from an aggregation in ES, which is an array of objects or slices.
    - the total amount of all expenses.
    - the total amount of all income.
    - the labels of all drilled down properties.
	Example: {
		slices: [ { key: <FieldToGet>, doc_count: <number>, sum_amount: { value: <number> }} ],
		totalCredit,
		totalDebit,
        labels [ { key: <KeyOfProperty>, level: <LevelOfProperty>, label: <LabelOfProperty> } ]
	}
*/
api.get('/expenses/:per/:lvl/:agroup/:aff/:dgroup/:dep/:fin/:cre', (req, res) => {
    let period                = req.params.per;
    const level               = req.params.lvl;
    const affairGroupID       = req.params.agroup;
    const affairID            = req.params.aff;
    const departmentGroupID   = req.params.dgroup;
    const departmentID        = req.params.dep;
    const financeKeyID        = req.params.fin;
    const creditorID          = req.params.cre;
    let mustAffairGroup       = {};
    let mustAffair            = {};
    let mustDepartmentGroup   = {};
    let mustDepartment        = {};
    let mustFinanceKey        = {};
    let mustCreditor          = {};
    let aggregator            = aggs[level];
    /*	Checking if we need to change period
        (user asking for whole year or quarter)
        <year>-0: all year
        <year>-1 ... <year>-4: quarter of year
        <year>-01 ... <year>-12: month of year
    */
    const year = period.substring(0,4);
    if (year === 'test') {
        period = '2014' + period.substring(4);
    }
    const foo = timeProcessor(period);
    const from = foo.from;
    const to = foo.to;

    const fieldValues = [affairGroupID, affairID, departmentGroupID, departmentID, financeKeyID, creditorID];
    let undef;
    let labels = [];
    
    // Find the index and keys for drilled properties
    const len = fieldValues.length;
    for (let i = 0; i < len - 2; i++) {
        if (fieldValues[i] !== 'all') {
            labels.push({
                key: fieldValues[i],
                level: i,
                label: aggs[i]
            });
        }
    }
    if (fieldValues[len - 2] !== 'all') {
        const typeFin = determineTypeOfFinanceKey(financeKeyID);
        let it;
        if (typeFin === 'Primary') {
            it = 4;
        } else if (typeFin === 'Secondary') {
            it = 5;
        } else {
            it = 6;
        }
        for (let i = 4; i <= it; i++) {
            labels.push({
                key: financeKeyID,
                level: i,
                label: aggs[i]
            });
        }
    }
    if (fieldValues[len - 1] !== 'all') {
        labels.push({
            key: fieldValues[len - 1],
            level: aggs.length - 1,
            label: 'Creditor'
        });
    }

	// Generate database queries based on parameters
    if (affairGroupID !== 'all') {
        mustAffairGroup = { "prefix": { "AffairGroup": { "value": affairGroupID } } };
    }
    if (affairID !== 'all') {
        mustAffair = { "prefix": { "Affair": { "value": affairID } } };
    }
    if (departmentGroupID !== 'all') {
        mustDepartmentGroup = { "prefix": { "DepartmentGroup": { "value": departmentGroupID } } };
    }
    if (departmentID !== 'all') {
        mustDepartment = { "prefix": { "Department": { "value": departmentID } } };
    }
    if (financeKeyID !== 'all') {
        const field = determineTypeOfFinanceKey(financeKeyID) + "FinanceKey";
        mustFinanceKey = { "prefix": { [field]: { "value": financeKeyID } } };
    }
    if (creditorID !== 'all') {
        mustCreditor = { "term": { "CreditorID": creditorID } };
    }

    const ind = 'hfp-' + year;
    // Query the database for all expenses
    elasticClient.search({
        index: ind,
        body: {
            "query": {
                "bool": {
                    "must": [
                        {   // Desired period
                            "filtered": {
                                "filter": {
                                    "range": {
                                        "Date": {
                                            "from": from,
                                            "to": to
                                        }
                                    }
                                }
                            }
                        },
                        {   // Exclude "Tekjur" Affair
                            "filtered": {
                                "filter": {
                                    "range": {
                                        "AffairID": {"gt": "01"}
                                    }
                                }
                            }
                        },
                        {   // All expenses
                            "filtered": {
                                "filter": {
                                    "range": {
                                        "PrimaryFinanceKey": { "gt": "0999" }
                                    }
                                }
                            }
                        },  // Drilldown
                        mustAffairGroup,
                        mustAffair,
                        mustDepartmentGroup,
                        mustDepartment,
                        mustFinanceKey,
                        mustCreditor
                    ]
                }
            },
            "size": 1,
            // Aggregate the total sums of Affairs and total expenses
            "aggs" : {
                "amounts" : {
                    "terms": {
                        "field": aggregator,
                        "order": { "sum_amount": "desc" },
                        "size": 0
                    },
                    "aggs" : {
                        "sum_amount": { "sum": { "field": "Amount" } },
                        "aggs": {
                            "terms": {
                                "field": "Creditor"
                            }
                        }
                    },
                },
                "total_amount": { "sum": { "field": "Amount" }}
            }
        }
    }).then((doc) => {
        // Find the labels of the drilled down labels in affair/department AND finance key (if any)
        for (let i = 0; i < labels.length; i++) {
            if (labels[i].label === 'Creditor') {
                labels[i].label = doc.hits.hits[0]._source[labels[i].label];
            } else {
                labels[i].key = doc.hits.hits[0]._source[labels[i].label].substring(0, labels[i].key.length);
                labels[i].label = doc.hits.hits[0]._source[labels[i].label].substring(labels[i].key.length + 1);
            }
        }
        // store the response from the database
        const slices = doc.aggregations.amounts.buckets;
        const totalCredit = doc.aggregations.total_amount.value;
        // Query the database for all incomes
        elasticClient.search({
            index: ind,
            body: {
                "query": {
                    "bool": {
                        "must": [
                            {   // All income
                                "filtered": {
                                    "filter": {
                                        "range": {
                                            "PrimaryFinanceKey": { "lt": "1000" }
                                        }
                                    }
                                }
                            },
                            {   // Desired period
                                "filtered": {
                                    "filter": {
                                        "range": {
                                            "Date": {
                                                "from": from,
                                                "to": to
                                            }
                                        }
                                    }
                                }
                            },
                            {   // Exclude "Tekjur" Affair
                                "filtered": {
                                    "filter": {
                                        "range": {
                                            "AffairID": {"gt": "01"}
                                        }
                                    }
                                }
                            },  // Drilldown
                            mustAffairGroup,
                            mustAffair,
                            mustDepartmentGroup,
                            mustDepartment,
                            mustFinanceKey,
                            mustCreditor
                        ]
                    }
                },
                "size": 0,
                "aggs" : {
                    "total_amount": { "sum": { "field": "Amount" } }
                }
            }
        }).then((docum) => {
            // Store the response and convert to absolute value
            const totalDebit = Math.abs(docum.aggregations.total_amount.value);
            elasticClient.search({
                index: ind,
                body: {
                    "query": {
                        "bool": {
                            "must": [
                                {   // Desired period
                                    "filtered": {
                                        "filter": {
                                            "range": {
                                                "Date": {
                                                    "from": year + "-01",
                                                    "to": year + "-13"
                                                }
                                            }
                                        }
                                    }
                                },
                                {   // Exclude "Tekjur" Affair
                                    "filtered": {
                                        "filter": {
                                            "range": {
                                                "AffairID": {"gt": "01"}
                                            }
                                        }
                                    }
                                },
                                {   // All expenses
                                    "filtered": {
                                        "filter": {
                                            "range": {
                                                "PrimaryFinanceKey": { "gt": "0999" }
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    "size": 0,
                    // Aggregate the total sums of Affairs and total expenses
                    "aggs" : {
                        "total_year": { "sum": { "field": "Amount" } }
                    }
                }
            }).then((docume) => {
                const totalYear = docume.aggregations.total_year.value;
                const respObj = { slices, totalCredit, totalDebit, totalYear, labels };
                //console.log(respObj);
                res.status(200).send(respObj);
            }, (err) => {
                console.log(err);
                res.status(500).send('Server error\n');
            });
        }, (err) => {
            console.log(err);
            res.status(500).send('Server error\n');
        });
    }, (err) => {
        console.log(err);
        res.status(500).send('Server error\n');
    });
});

/*
    This route will return an object containing 4 things:
    - a bucket from an aggregation in ES, which is an array of objects or slices.
    - the total amount of all expenses.
    - the total amount of all income.
    - the labels of all drilled down properties.
    Example: {
        slices: [ { key: <FieldToGet>, doc_count: <number>, sum_amount: { value: <number> }} ],
        totalCredit,
        totalDebit,
        labels [ { key: <KeyOfProperty>, level: <LevelOfProperty>, label: <LabelOfProperty> } ]
    }
 */
api.get('/joint-revenue/:per/:lvl/:dep/:fin/:cre', (req, res) => {
    let period                = req.params.per;
    const level               = req.params.lvl;
    const departmentID        = req.params.dep;
    const financeKeyID        = req.params.fin;
    const creditorID          = req.params.cre;
    let mustDepartment        = {};
    let mustFinanceKey        = {};
    let mustCreditor          = {};
    let aggregator            = aggs[parseInt(level)];

    const year = period.substring(0,4);
    if (year === 'test') {
        period = '2014' + period.substring(4);
    }
    const foo = timeProcessor(period);
    const from = foo.from;
    const to = foo.to;

    const fieldValues = [departmentID, financeKeyID, creditorID];
    let undef;
    let labels = [];

    // Find the index and keys for drilled properties
    const len = fieldValues.length;
    if (fieldValues[0] !== 'all') {
        labels.push({
            key: fieldValues[0],
            level: 3,
            label: aggs[3]
        });
    }
    if (fieldValues[len - 2] !== 'all') {
        const typeFin = determineTypeOfFinanceKey(financeKeyID);
        let it;
        if (typeFin === 'Primary') {
            it = 4;
        } else if (typeFin === 'Secondary') {
            it = 5;
        } else {
            it = 6;
        }
        for (let i = 4; i <= it; i++) {
            labels.push({
                key: financeKeyID,
                level: i,
                label: aggs[i]
            });
        }
    }
    if (fieldValues[len - 1] !== 'all') {
        labels.push({
            key: fieldValues[len - 1],
            level: aggs.length - 1,
            label: 'Creditor'
        });
    }

    if (departmentID !== 'all') {
        mustDepartment = {
            "prefix": { "Department": { "value": departmentID } }
        };
    }
    if (financeKeyID !== 'all') {
        if (financeKeyID.substring(1,4) === '000') {
            mustFinanceKey = {
                "prefix": { "PrimaryFinanceKey": { "value": financeKeyID } }
            };
        } else if (financeKeyID.substring(2,4) === '00' || financeKeyID.substring(1,3) === '00') {
            mustFinanceKey = {
                "prefix": { "SecondaryFinanceKey": { "value": financeKeyID } }
            };
        } else {
            mustFinanceKey = {
                "prefix": { "FinanceKey": { "value": financeKeyID } }
            };
        }
    }
    if (creditorID !== 'all') {
        mustCreditor = {
            "prefix": { "CreditorID": { "value": creditorID } }
        };
    }

    const ind = 'hfp-' + year;
    // Query the database for all incomes
    elasticClient.search({
        index: ind,
        body: {
            "query": {
                "bool": {
                    "must": [
                        {   // only income
                            "filtered": {
                                "filter": {
                                    "range": {
                                        "Amount": { "lt": 0 }
                                    }
                                }
                            }
                        },
                        {   // Desired period
                            "filtered": {
                                "filter": {
                                    "range": {
                                        "Date": {
                                            "from": from,
                                            "to": to
                                        }
                                    }
                                }
                            }
                        },
                        {   // only "Tekjur" Affair
                            "term": {
                                "Affair": { "value": "00-Tekjur" }
                            }
                        },  // Drilldown
                        mustDepartment,
                        mustFinanceKey,
                        mustCreditor
                    ]
                }
            },
            "size": 1,
            "aggs" : {
                "amounts" : {
                    "terms": {
                        "field": aggregator,
                        "order": { "sum_amount": "asc" },
                        "size": 0
                    },
                    "aggs" : {
                        "sum_amount": { "sum": { "field": "Amount" } },
                        "aggs": {
                            "terms": {
                                "field": "Creditor"
                            }
                        }                        
                    }
                },
                "total_amount": { "sum": { "field": "Amount" }}
            }
        }
    }).then((doc) => {
        // Find the labels of the drilled down labels in affair/department AND finance key (if any)
        for (let i = 0; i < labels.length; i++) {
            if (labels[i].label === 'Creditor') {
                labels[i].label = doc.hits.hits[0]._source[labels[i].label];
            } else {
                labels[i].key = doc.hits.hits[0]._source[labels[i].label].substring(0, labels[i].key.length);
                labels[i].label = doc.hits.hits[0]._source[labels[i].label].substring(labels[i].key.length + 1);
            }
        }

        // store the response from the database
        const slices = doc.aggregations.amounts.buckets.map(entry => {
            entry.sum_amount.value = Math.abs(entry.sum_amount.value);
            return entry;
        });
        const totalDebit = Math.abs(doc.aggregations.total_amount.value);
        // Query the database for all expenses
        elasticClient.search({
            index: ind,
            body: {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "filtered": {
                                    "filter": {
                                        "range": {
                                            "Amount": { "gt": 0 }
                                        }
                                    }
                                }
                            },
                            {   // Desired period
                                "filtered": {
                                    "filter": {
                                        "range": {
                                            "Date": {
                                                "from": from,
                                                "to": to
                                            }
                                        }
                                    }
                                }
                            },
                            {   // only "Tekjur" Affair
                                "term": {
                                    "Affair": { "value": "00-Tekjur" }
                                }
                            },
                            // Drilldown
                            mustDepartment,
                            mustFinanceKey,
                            mustCreditor
                        ]
                    }
                },
                "size": 0,
                "aggs" : {
                    "total_amount": { "sum": { "field": "Amount" }}
                }
            }
        }).then((docum) => {
            // Store the response and convert to absolute value
            const totalCredit = docum.aggregations.total_amount.value;
            elasticClient.search({
                index: ind,
                body: {
                    "query": {
                        "bool": {
                            "must": [
                                {   // only income
                                    "filtered": {
                                        "filter": {
                                            "range": {
                                                "Amount": { "lt": 0 }
                                            }
                                        }
                                    }
                                },
                                {   // Desired period
                                    "filtered": {
                                        "filter": {
                                            "range": {
                                                "Date": {
                                                    "from": year + "-01",
                                                    "to": year + "-13"
                                                }
                                            }
                                        }
                                    }
                                },
                                {   // only "Tekjur" Affair
                                    "term": {
                                        "Affair": { "value": "00-Tekjur" }
                                    }
                                }
                            ]
                        }
                    },
                    "size": 0,
                    "aggs" : {
                        "total_year": { "sum": { "field": "Amount" }}
                    }
                }
            }).then((docume) => {
                const totalYear = Math.abs(docume.aggregations.total_year.value);
                const respObj = { slices, totalCredit, totalDebit, totalYear, labels };
                //console.log(respObj);
                res.status(200).send(respObj);
            }, (err) => {
                console.log(err);
                res.status(500).send('Server error\n');
            });
        }, (err) => {
            console.log(err);
            res.status(500).send('Server error\n');
        });
    }, (err) => {
        console.log(err);
        res.status(500).send('Server error\n');
    });
});

/*
    This route will return an object containing 4 things:
    - a bucket from an aggregation in ES, which is an array of objects or slices.
    - the total amount of all expenses.
    - the total amount of all income.
    - the labels of all drilled down properties.
    Example: {
        slices: [ { key: <FieldToGet>, doc_count: <number>, sum_amount: { value: <number> }} ],
        totalCredit,
        totalDebit,
        labels [ { key: <KeyOfProperty>, level: <LevelOfProperty>, label: <LabelOfProperty> } ]
    }
 */
api.get('/special-revenue/:per/:lvl/:agroup/:aff/:dgroup/:dep/:fin/:cre', (req, res) => {
    let period                = req.params.per;
    const level               = req.params.lvl;
    const affairGroupID       = req.params.agroup;
    const affairID            = req.params.aff;
    const departmentGroupID   = req.params.dgroup;
    const departmentID        = req.params.dep;
    const financeKeyID        = req.params.fin;
    const creditorID          = req.params.cre;
    let mustAffairGroup       = {};
    let mustAffair            = {};
    let mustDepartmentGroup   = {};
    let mustDepartment        = {};
    let mustFinanceKey        = {};
    let mustCreditor          = {};
    let aggregator            = aggs[level];
    /*	Checking if we need to change period
     (user asking for whole year or quarter)
     <year>-0: all year
     <year>-1 ... <year>-4: quarter of year
     <year>-01 ... <year>-12: month of year
     */
    const year = period.substring(0,4);
    if (year === 'test') {
        period = '2014' + period.substring(4);
    }
    const foo = timeProcessor(period);
    const from = foo.from;
    const to = foo.to;

    const fieldValues = [affairGroupID, affairID, departmentGroupID, departmentID, financeKeyID, creditorID];
    let labels = [];

    // Find the index and keys for drilled properties
    let len = fieldValues.length;
    for (let i = 0; i < len - 2; i++) {
        if (fieldValues[i] !== 'all') {
            labels.push({
                key: fieldValues[i],
                level: i,
                label: aggs[i]
            });
        }
    }
    if (fieldValues[len - 2] !== 'all') {
        const typeFin = determineTypeOfFinanceKey(financeKeyID);
        let it;
        if (typeFin === 'Primary') {
            it = 4;
        } else if (typeFin === 'Secondary') {
            it = 5;
        } else {
            it = 6;
        }
        for (let i = 4; i <= it; i++) {
            labels.push({
                key: financeKeyID,
                level: i,
                label: aggs[i]
            });
        }
    }
    if (fieldValues[len - 1] !== 'all') {
        labels.push({
            key: fieldValues[len - 1],
            level: aggs.length - 1,
            label: 'Creditor'
        });
    }

    // Generate database queries based on parameters
    if (affairGroupID !== 'all') {
        mustAffairGroup = { "prefix": { "AffairGroup": { "value": affairGroupID } } };
    }
    if (affairID !== 'all') {
        mustAffair = { "prefix": { "Affair": { "value": affairID } } };
    }
    if (departmentGroupID !== 'all') {
        mustDepartmentGroup = { "prefix": { "DepartmentGroup": { "value": departmentGroupID } } };
    }
    if (departmentID !== 'all') {
        mustDepartment = { "prefix": { "Department": { "value": departmentID } } };
    }
    if (financeKeyID !== 'all') {
        if (financeKeyID.substring(1,4) === '000') {
            mustFinanceKey = { "prefix": { "PrimaryFinanceKey": { "value": financeKeyID } } };
        } else if (financeKeyID.substring(2,4) === '00' || financeKeyID.substring(1,3) === '00') {
            mustFinanceKey = { "prefix": { "SecondaryFinanceKey": { "value": financeKeyID } } };
        } else {
            mustFinanceKey = { "prefix": { "FinanceKey": { "value": financeKeyID } } };
        }
    }
    if (creditorID !== 'all') {
        mustCreditor = { "prefix": { "CreditorID": { "value": creditorID } } };
    }

    const ind = 'hfp-' + year;
    // Query the database for all revenues
    elasticClient.search({
        index: ind,
        body: {
            "query": {
                "bool": {
                    "must": [
                        {   // Only revenues
                            "filtered": {
                                "filter": {
                                    "range": {
                                        "Amount": { "lt": 0 }
                                    }
                                }
                            }
                        },
                        {   // Desired period
                            "filtered": {
                                "filter": {
                                    "range": {
                                        "Date": {
                                            "from": from,
                                            "to": to
                                        }
                                    }
                                }
                            }
                        },
                        {   // Exclude Tekjur
                            "filtered": {
                                "filter": {
                                    "range": {
                                        "AffairID": { "gt": "01" }
                                    }
                                }
                            }
                        },  // Drilldown
                        mustAffairGroup,
                        mustAffair,
                        mustDepartmentGroup,
                        mustDepartment,
                        mustFinanceKey,
                        {   // Only "Tekjur" PrimaryFinanceKey
                            "prefix": {
                                "PrimaryFinanceKey": { "value": "0" }
                            }
                        },
                        mustCreditor
                    ]
                }
            },
            "size": 1,
            // Aggregate the total sums of Affairs and total revenue
            "aggs" : {
                "amounts" : {
                    "terms": {
                        "field": aggregator,
                        "order": { "sum_amount": "asc" },
                        "size": 0
                    },
                    "aggs" : {
                        "sum_amount": { "sum": { "field": "Amount" } },
                        "aggs": {
                            "terms": {
                                "field": "Creditor"
                            }
                        }
                    }
                },
                "total_amount": { "sum": { "field": "Amount" }}
            }
        }
    }).then((doc) => {
        // Find the labels of the drilled down labels in affair/department AND finance key (if any)
        for (let i = 0; i < labels.length; i++) {
            if (labels[i].label === 'Creditor') {
                labels[i].label = doc.hits.hits[0]._source[labels[i].label];
            } else {
                labels[i].key = doc.hits.hits[0]._source[labels[i].label].substring(0, labels[i].key.length);
                labels[i].label = doc.hits.hits[0]._source[labels[i].label].substring(labels[i].key.length + 1);
            }
        }

        // store the response from the database
        const slices = doc.aggregations.amounts.buckets.map(entry => {
            entry.sum_amount.value = Math.abs(entry.sum_amount.value);
            return entry;
        });
        const totalDebit = Math.abs(doc.aggregations.total_amount.value);
        // Query the database for all revenue
        elasticClient.search({
            index: ind,
            body: {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "filtered": {
                                    "filter": {
                                        "range": {
                                            "Amount": { "gt": 0 }
                                        }
                                    }
                                }
                            },
                            {   // Desired period
                                "filtered": {
                                    "filter": {
                                        "range": {
                                            "Date": {
                                                "from": from,
                                                "to": to
                                            }
                                        }
                                    }
                                }
                            },
                            {   // Exclude "Tekjur" Affair
                                "filtered": {
                                    "filter": {
                                        "range": {
                                            "AffairID": { "gt": "01" }
                                        }
                                    }
                                }
                            },  // Drilldown
                            mustAffairGroup,
                            mustAffair,
                            mustDepartmentGroup,
                            mustDepartment,
                            mustFinanceKey,
                            {
                                "prefix": {
                                    "PrimaryFinanceKey": {
                                        "value": "0"
                                    }
                                }
                            },
                            mustCreditor
                        ]
                    }
                },
                "size": 0,
                "aggs" : {
                    "total_amount": { "sum": { "field": "Amount" }}
                }
            }
        }).then((docum) => {
            // Store the response and convert to absolute value
            const totalCredit = Math.abs(docum.aggregations.total_amount.value);
            elasticClient.search({
                index: ind,
                body: {
                    "query": {
                        "bool": {
                            "must": [
                                {   // Only revenues
                                    "filtered": {
                                        "filter": {
                                            "range": {
                                                "Amount": { "lt": 0 }
                                            }
                                        }
                                    }
                                },
                                {   // Desired period
                                    "filtered": {
                                        "filter": {
                                            "range": {
                                                "Date": {
                                                    "from": year + "-01",
                                                    "to": year + "-13"
                                                }
                                            }
                                        }
                                    }
                                },
                                {   // Exclude Tekjur
                                    "filtered": {
                                        "filter": {
                                            "range": {
                                                "AffairID": { "gt": "01" }
                                            }
                                        }
                                    }
                                },
                                {   // Only "Tekjur" PrimaryFinanceKey
                                    "prefix": {
                                        "PrimaryFinanceKey": { "value": "0" }
                                    }
                                }

                            ]
                        }
                    },
                    "size": 0,
                    // Aggregate the total sums of Affairs and total revenue
                    "aggs" : {
                        "total_year": { "sum": { "field": "Amount" }}
                    }
                }
            }).then((docume) => {
                const totalYear = Math.abs(docume.aggregations.total_year.value);
                const respObj = { slices, totalCredit, totalDebit, totalYear, labels };
                //console.log(respObj);
                res.status(200).send(respObj);
            }, (err) => {
                console.log(err);
                res.status(500).send('Server error\n');
            });
        }, (err) => {
            console.log(err);
            res.status(500).send('Server error\n');
        });
    }, (err) => {
        console.log(err);
        res.status(500).send('Server error\n');
    });
});

module.exports = {
    api: api,
    timeProcessor: timeProcessor,
    determineTypeOfFinanceKey: determineTypeOfFinanceKey
};
