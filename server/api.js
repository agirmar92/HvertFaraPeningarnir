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

api.use(bodyParser.json());

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
api.get('/expenses/:period/:fieldToGet', (req, res) => {
	/*	Checking if we need to change period
		(user asking for whole year or quarter)
		<year>-0: all year
		<year>-1 ... <year>-4: quarter of year
		<year>-01 ... <year>-12: month of year
	*/
	var period = req.params.period;
	var year = period.substring(0,5);
	var from = ''; var to = '';
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
		var month = parseInt(period.substring(5,7), 10);
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

	// Query the database for all expenses
	elasticClient.search({
		index: 'hfp',
		body: {
			"query": {
		        "filtered": {
		        	// Exclude "Tekjur" Affair
		            "filter": {
		                "range" : {
		                    "AffairID" : {
		                        "gt" : "01"
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
		                "field": req.params.fieldToGet,
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
			                "prefix": {
			                   "Date": {
			                       "value": period
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
api.get('/income/:period/:fieldToGet', (req, res) => {
	// Query the database for all expenses
	elasticClient.search({
		index: 'hfp',
		body: {
			"query": {
				"filtered": {
					"query": {
						"bool": {
							"must": [
								{
									"term": {
										"Affair": {
											"value": "Tekjur"
										}
									}
								}
							]
						}
					},
					"filter": {
						"range" : {
							"Amount" : {
								"lt" : 0
							}
						}
					}
				}
			},
			"size": 0,
			"aggs" : {
				"amounts" : {
					"terms": {
						"field": "Department",
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
		// Query the database for all incomes
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
