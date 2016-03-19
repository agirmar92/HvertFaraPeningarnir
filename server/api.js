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
api.get('/:fieldToGet', (req, res) => {
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

module.exports = api;
