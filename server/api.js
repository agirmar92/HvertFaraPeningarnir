'use strict';

// Modules
const express = require('express');
const bodyParser = require('body-parser');
const elasticsearch = require('elasticsearch');
const Promise = require('promise');

// Globals
const api = express();
const elasticClient = new elasticsearch.Client({
	host: 'http://hfp.northeurope.cloudapp.azure.com:9200'
});
const aggs = [ "AffairGroup", "Affair", "DepartmentGroup", "Department", "PrimaryFinanceKey", "SecondaryFinanceKey", "FinanceKey", "Creditor" ];
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

const getLabels = (drillPath) => {
    return new Promise((resolve, reject) => {
        let firstLabel;
        let secondLabel;
        let valueF;
        let querying1 = false;
        let querying2 = false;
        for (let i = drillPath.length - 2; i >= 0; i--) {
            valueF = drillPath[i];
            if (valueF !== 'all') {
                let field;
                let sep;
                querying1 = true;
                if (i === 3) {
                    field = "Department";
                    sep = 7;
                } else if (i === 2) {
                    field = "DepartmentGroup";
                    sep = 4;
                } else if (i === 1) {
                    field = "Affair";
                    sep = 3;
                } else {
                    field = "AffairGroup";
                    sep = 2;
                }
                console.log('HÉR!');
                elasticClient.search({
                    index: 'hfp',
                    body: {
                        "query": {
                            "prefix": {
                                [field]: {
                                    "value": valueF
                                }
                            }
                        },
                        "size": 1
                    }
                }).then((doc) => {
                    console.log('res: ' + res);
                    firstLabel = doc.hits.hits[0]._source[field].substring(sep);
                    querying1 = false;
                    const last = drillPath.length - 1;
                    const value = drillPath[last];
                    if (value !== 'all') {
                        const field = determineTypeOfFinanceKey(value) + "FinanceKey";
                        elasticClient.search({
                            index: 'hfp',
                            body: {
                                "query": {
                                    "prefix": {
                                        [field]: {
                                            "value": value
                                        }
                                    }
                                },
                                "size": 1
                            }
                        }).then((doc) => {
                            secondLabel = doc.hits.hits[0]._source[field].substring(5);
                            resolve([ firstLabel, secondLabel ]);
                        }, (err) => {
                            console.log(err);
                            reject('REJECTED!!');
                        });
                    } else {
                        resolve([ firstLabel, secondLabel ]);
                    }
                }, (err) => {
                    console.log('error');
                    querying1 = false;
                });
                break;
            } else if (i === 0) {
                firstLabel = 'Kópavogsbær';
                const last = drillPath.length - 1;
                const value = drillPath[last];
                if (value !== 'all') {
                    const field = determineTypeOfFinanceKey(value) + "FinanceKey";
                    elasticClient.search({
                        index: 'hfp',
                        body: {
                            "query": {
                                "prefix": {
                                    [field]: {
                                        "value": value
                                    }
                                }
                            },
                            "size": 1
                        }
                    }).then((doc) => {
                        secondLabel = doc.hits.hits[0]._source[field].substring(5);
                        resolve([ firstLabel, secondLabel ]);
                    }, (err) => {
                        console.log(err);
                        reject('REJECTED!!');
                    });
                } else {
                    resolve([ firstLabel, secondLabel ]);
                }
            }
        }
    })
};

const determineTypeOfFinanceKey = (key) => {
    if (key !== 'all') {
        if (key.substring(1,4) === '000') {
            return "Primary";
        } else if (key.substring(2,4) === '00' || key.substring(1,3) == '00') {
            return "Secondary";
        } else {
            return "";
        }
    }
    return "Invalid Input";
};

/* 
	This route will return an object containing 3 things:
	- a bucket from an aggregation in ES, which is an array of objects or slices
	- the total amount of all expenses
	- the total amount of all income.
	Example: {
		slices: [ { key: <FieldToGet>, doc_count: <number>, sum_amount: { value: <number> }} ],
		totalCredit,
		totalDebit
	}
*/
api.get('/expenses/:per/:lvl/:agroup/:aff/:dgroup/:dep/:fin', (req, res) => {
	const period              = req.params.per;
    const level               = req.params.lvl;
	const affairGroupID       = req.params.agroup;
	const affairID            = req.params.aff;
	const departmentGroupID   = req.params.dgroup;
	const departmentID        = req.params.dep;
	const financeKeyID        = req.params.fin;
	let mustAffairGroup       = {};
	let mustAffair            = {};
	let mustDepartmentGroup   = {};
	let mustDepartment        = {};
	let mustFinanceKey        = {};
	let aggregator            = aggs[level];
	//console.log('aggregator: ' + aggregator);
	/*	Checking if we need to change period
		(user asking for whole year or quarter)
		<year>-0: all year
		<year>-1 ... <year>-4: quarter of year
		<year>-01 ... <year>-12: month of year
	*/
	const foo = timeProcessor(period);
    const from = foo.from;
    const to = foo.to;

    //const deepestLabels = getLabels([affairGroupID, affairID, departmentGroupID, departmentID, financeKey]);

	// Generate database queries based on parameters
	if (affairGroupID !== 'all') {
		mustAffairGroup = { 
			"prefix": { "AffairGroup": { "value": affairGroupID } } 
		};
	}
	if (affairID !== 'all') {
		mustAffair = { 
			"prefix": { "Affair": { "value": affairID } } 
		};
	}
	if (departmentGroupID !== 'all') {
		mustDepartmentGroup = { 
			"prefix": { "DepartmentGroup": { "value": departmentGroupID } } 
		};
	}
	if (departmentID !== 'all') {
		mustDepartment = {
			"prefix": { "Department": { "value": departmentID } } 
		};
	}
	if (financeKeyID !== 'all') {
        const field = determineTypeOfFinanceKey(financeKeyID) + "FinanceKey";
        mustFinanceKey = {
            "prefix": { [field]: { "value": financeKeyID } }
        }
	}	

	// Query the database for all expenses
	elasticClient.search({
		index: 'hfp',
		body: {
			"query": {
		        "filtered": {
		        	// Only expenses
		            "filter": {
		                "range" : {
		                    "Amount" : {
		                        "gt" : 0
		                    }
		                }
		            },
		            // Desired period
		            "query": {
		                "filtered": {
		                    "filter": {
		                        "range": {
		                            "Date": {
		                                "from": from,
		                                "to": to
		                            }
		                        }
		                    },
		                    // Exclude "Tekjur" Affair
		                    "query": {
		                    	"filtered": {
		                    		"filter": {
		                    			"range": {
		                    				"AffairID": {
		                    					"gt": "01"
		                    				}
		                    			}
		                    		},
		                    		// Drilldown
		                    		"query": {
		                    			"bool": {
		                    				"must" : [
		                    					mustAffairGroup,
		                    					mustAffair,
		                    					mustDepartmentGroup,
		                    					mustDepartment,
		                    					mustFinanceKey
		                    				]
		                    			}
		                    		}
		                    	}
		                    }
		                }
		            }
		        }
		    }, 
		    "size": 0, 
		    // Aggregate the total sums of Affairs and total expenses
		    "aggs" : {
		        "amounts" : {
		            "terms": {
		                "field": aggregator,
		                "order": { "sum_amount": "desc" },
		                "size": 0
		            },
		            "aggs" : {
		                "sum_amount": { "sum": { "field": "Amount" } }
		            }
		        },
		        "total_amount": { "sum": { "field": "Amount" }}
		    }
		}
	}).then((doc) => {
		// store the response from the database
		const slices = doc.aggregations.amounts.buckets;
		const totalCredit = doc.aggregations.total_amount.value;
		// Query the database for all incomes
		elasticClient.search({
			index: 'hfp',
			body: {
				"query": {
			        "filtered": {
			            "filter": {
			                "range" : {
			                    "Amount" : {
			                        "lt" : 0
			                    }
			                }
			            },
			            // Desired period
			            "query": {
                            "filtered": {
                                "filter": {
                                    "range": {
                                        "Date": {
                                            "from": from,
                                            "to": to
                                        }
                                    }
                                },
                                // Exclude "Tekjur" Affair
                                "query": {
                                    "filtered": {
                                        "filter": {
                                            "range": {
                                                "AffairID": {
                                                    "gt": "01"
                                                }
                                            }
                                        },
                                        // Drilldown
                                        "query": {
                                            "bool": {
                                                "must" : [
                                                    mustAffairGroup,
                                                    mustAffair,
                                                    mustDepartmentGroup,
                                                    mustDepartment,
                                                    mustFinanceKey
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
			            }
			        }
			    }, 
			    "size": 0, 
			    "aggs" : {
			        "total_amount": { "sum": { "field": "Amount" }}
			    }
			}
		}).then((docum) => {
			// Store the response and convert to absolute value
			const totalDebit = Math.abs(docum.aggregations.total_amount.value);
			const respObj = { slices, totalCredit, totalDebit };
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
});

/*
 This route will return an object containing 3 things:
 - a bucket from an aggregation in ES, which is an array of objects or slices
 - the total amount of all expenses
 - the total amount of all income.
 Example: {
 slices: [ { key: <FieldToGet>, doc_count: <number>, sum_amount: { value: <number> }} ],
 totalCredit,
 totalDebit
 }
 */
api.get('/joint-revenue/:per/:lvl/:dep/:fin', (req, res) => {
    const period              = req.params.per;
    const level               = req.params.lvl;
    const departmentID        = req.params.dep;
    const financeKeyID        = req.params.fin;
    let mustDepartment        = {};
    let mustFinanceKey        = {};
    let aggregator            = aggs[parseInt(level)];

    const foo = timeProcessor(period);
    const from = foo.from;
    const to = foo.to;
    //console.log('departmentID: ' + departmentID);
    //console.log('financeKeyID: ' + financeKeyID);

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

    // Query the database for all incomes
	elasticClient.search({
		index: 'hfp',
		body: {
            // only income
			"query": {
				"filtered": {
                    "filter": {
                        "range" : {
                            "Amount" : {
                                "lt" : 0
                            }
                        }
                    },
                    // Desired period
                    "query": {
                        "filtered": {
                            "filter": {
                                "range": {
                                    "Date": {
                                        "from": from,
                                        "to": to
                                    }
                                }
                            },
                            "query": {
                                "bool": {
                                    "must": [
                                        {
                                            // only "Tekjur" Affair
                                            "term": {
                                                "Affair": {
                                                    "value": "00-Tekjur"
                                                }
                                            }
                                        },
                                        // Drilldown
                                        mustDepartment,
                                        mustFinanceKey
                                    ]
                                }
                            }
                        }
					}
				}
			},
			"size": 0,
			"aggs" : {
				"amounts" : {
					"terms": {
						"field": aggregator,
						"order": { "sum_amount": "asc" },
						"size": 0
					},
					"aggs" : {
						"sum_amount": { "sum": { "field": "Amount" } }
					}
				},
				"total_amount": { "sum": { "field": "Amount" }}
			}
		}
	}).then((doc) => {
		// store the response from the database
		const slices = doc.aggregations.amounts.buckets.map(entry => {
			entry.sum_amount.value = Math.abs(entry.sum_amount.value);
			return entry;
		});
		const totalDebit = Math.abs(doc.aggregations.total_amount.value);
		// Query the database for all expenses
		elasticClient.search({
			index: 'hfp',
			body: {
				"query": {
					"filtered": {
						"filter": {
							"range" : {
								"Amount" : {
									"gt" : 0
								}
							}
						},
                        // Desired period
                        "query": {
                            "filtered": {
                                "filter": {
                                    "range": {
                                        "Date": {
                                            "from": from,
                                            "to": to
                                        }
                                    }
                                },
                                // Only "Tekjur" Affair
                                "query": {
                                    "bool": {
                                        "must" : [
                                            {
                                                // only "Tekjur" Affair
                                                "term": {
                                                    "Affair": {
                                                        "value": "00-Tekjur"
                                                    }
                                                }
                                            },
                                            // Drilldown
                                            mustDepartment,
                                            mustFinanceKey
                                        ]
                                    }
                                }
                            }
                        }
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
            const respObj = { slices, totalCredit, totalDebit };
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
});

/*
 This route will return an object containing 3 things:
 - a bucket from an aggregation in ES, which is an array of objects or slices
 - the total amount of all expenses
 - the total amount of all income.
 Example: {
 slices: [ { key: <FieldToGet>, doc_count: <number>, sum_amount: { value: <number> }} ],
 totalCredit,
 totalDebit
 }
 */
api.get('/special-revenue/:per/:lvl/:agroup/:aff/:dgroup/:dep/:fin', (req, res) => {
    const period              = req.params.per;
    const level               = req.params.lvl;
    const affairGroupID       = req.params.agroup;
    const affairID            = req.params.aff;
    const departmentGroupID   = req.params.dgroup;
    const departmentID        = req.params.dep;
    const financeKeyID        = req.params.fin;
    let mustAffairGroup       = {};
    let mustAffair            = {};
    let mustDepartmentGroup   = {};
    let mustDepartment        = {};
    let mustFinanceKey        = {};
    let aggregator            = aggs[level];
    //console.log('aggregator: ' + aggregator);
    /*	Checking if we need to change period
     (user asking for whole year or quarter)
     <year>-0: all year
     <year>-1 ... <year>-4: quarter of year
     <year>-01 ... <year>-12: month of year
     */
    const foo = timeProcessor(period);
    const from = foo.from;
    const to = foo.to;

    // Generate database queries based on parameters
    if (affairGroupID !== 'all') {
        mustAffairGroup = {
            "prefix": { "AffairGroup": { "value": affairGroupID } }
        };
    }
    if (affairID !== 'all') {
        mustAffair = {
            "prefix": { "Affair": { "value": affairID } }
        };
    }
    if (departmentGroupID !== 'all') {
        mustDepartmentGroup = {
            "prefix": { "DepartmentGroup": { "value": departmentGroupID } }
        };
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

    // Query the database for all revenues
    elasticClient.search({
        index: 'hfp',
        body: {
            "query": {
                "filtered": {
                    // Only revenues
                    "filter": {
                        "range" : {
                            "Amount" : {
                                "lt" : 0
                            }
                        }
                    },
                    // Desired period
                    "query": {
                        "filtered": {
                            "filter": {
                                "range": {
                                    "Date": {
                                        "from": from,
                                        "to": to
                                    }
                                }
                            },
                            // Exclude "Tekjur" Affair
                            "query": {
                                "filtered": {
                                    "filter": {
                                        "range": {
                                            "AffairID": {
                                                "gt": "01"
                                            }
                                        }
                                    },
                                    "query": {
                                        "bool": {
                                            "must" : [
                                                // Drilldown
                                                mustAffairGroup,
                                                mustAffair,
                                                mustDepartmentGroup,
                                                mustDepartment,
                                                mustFinanceKey,
                                                // Only "Tekjur" PrimaryFinanceKey
                                                {
                                                    "prefix": {
                                                        "PrimaryFinanceKey": {
                                                            "value": "0"
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "size": 0,
            // Aggregate the total sums of Affairs and total revenue
            "aggs" : {
                "amounts" : {
                    "terms": {
                        "field": aggregator,
                        "order": { "sum_amount": "asc" },
                        "size": 0
                    },
                    "aggs" : {
                        "sum_amount": { "sum": { "field": "Amount" } }
                    }
                },
                "total_amount": { "sum": { "field": "Amount" }}
            }
        }
    }).then((doc) => {
        // store the response from the database
        const slices = doc.aggregations.amounts.buckets.map(entry => {
            entry.sum_amount.value = Math.abs(entry.sum_amount.value);
            return entry;
        });
        const totalDebit = Math.abs(doc.aggregations.total_amount.value);
        // Query the database for all revenue
        elasticClient.search({
            index: 'hfp',
            body: {
                "query": {
                    "filtered": {
                        "filter": {
                            "range" : {
                                "Amount" : {
                                    "gt" : 0
                                }
                            }
                        },
                        // Desired period
                        "query": {
                            "filtered": {
                                "filter": {
                                    "range": {
                                        "Date": {
                                            "from": from,
                                            "to": to
                                        }
                                    }
                                },
                                // Exclude "Tekjur" Affair
                                "query": {
                                    "filtered": {
                                        "filter": {
                                            "range": {
                                                "AffairID": {
                                                    "gt": "01"
                                                }
                                            }
                                        },
                                        // Drilldown
                                        "query": {
                                            "bool": {
                                                "must" : [
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
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
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
            const respObj = { slices, totalCredit, totalDebit };
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
});

module.exports = {
    api: api,
    timeProcessor: timeProcessor,
    determineTypeOfFinanceKey: determineTypeOfFinanceKey,
    getLabels: getLabels
};
