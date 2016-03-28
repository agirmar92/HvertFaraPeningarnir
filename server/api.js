'use strict';

// Modules
const express = require('express');
const bodyParser = require('body-parser');
const elasticsearch = require('elasticsearch');

// Globals
const api = express();
const elasticClient = new elasticsearch.Client({
	host: 'http://hfp.northeurope.cloudapp.azure.com:9200'
});
const aggs = [ "AffairGroup", "Affair", "DepartmentGroup", "Department", "PrimaryFinanceKey", "SecondaryFinanceKey", "FinanceKey", "Creditor" ]

api.use(bodyParser.json());

const timeProcessor = (period) => {
    let year = period.substring(0,5);
    let from = '';
    let to = '';
    if (period.length === 6) {
        if (period.charAt(5) === '0') {
            // whole year
            from = year + '01'; to = year + '13';
        } else if (period.charAt(5) === '1') {
            // quarters
            from = year + '01'; to = year + '04';
        } else if (period.charAt(5) === '2') {
            from = year + '04'; to = year + '07';
        } else if (period.charAt(5) === '3') {
            from = year + '07'; to = year + '10';
        } else if (period.charAt(5) === '4') {
            from = year + '10'; to = year + '13';
        }
    } else {
        // months
        let month = parseInt(period.substring(5,7), 10);
        if (month < 9) {
            from = year + '0' + month;
            to = year + '0' + (month + 1);
        } else if (month === 9) {
            from = year + '0' + month;
            to = year + (month + 1);
        } else {
            from = year + month;
            to = year + (month + 1);
        }
    }
    return { "from": from, "to": to };
}

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
	console.log(aggregator);
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
		} else if (financeKeyID.substring(2,4) === '00') {
			mustFinanceKey = { 
				"prefix": { "SecondaryFinanceKey": { "value": financeKeyID } } 
			};
		} else {
			mustFinanceKey = { 
				"prefix": { "FinanceKey": { "value": financeKeyID } } 
			};
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
api.get('/income/:per/:lvl/:dep/:fin', (req, res) => {
    const period              = req.params.per;
    const level               = req.params.lvl;
    const departmentID        = req.params.dep;
    const financeKeyID        = req.params.fin;
    let mustDepartment        = {};
    let mustFinanceKey        = {};
    let aggregator            = aggs[parseInt(level) + 3];

    const foo = timeProcessor(period);
    const from = foo.from;
    const to = foo.to;
    console.log(aggregator);
    console.log(level);

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
        } else if (financeKeyID.substring(2,4) === '00') {
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
                                                        "value": "Tekjur"
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
			res.status(200).send({ slices, totalCredit, totalDebit });
		}, (err) => {
			console.log(err);
			res.status(500).send('Server error\n');
		});
	}, (err) => {
		console.log(err);
		res.status(500).send('Server error\n');
	});
});

module.exports = api;
