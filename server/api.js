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
*	This route will return two buckets from a aggregations in elasticSearch
*	which are arrays of objects like so:
*	[ {key:Affair, doc_count: number, sum_amount: {value}} ]
*/
api.get('/', (req, res) => {
	/* Fetch all answers from database
	models.Answer.find({}, (err, docs) => {
		if (err) {
			res.status(500).send('Server error.\n');
			return;
		}
		if (docs.length === 0) {
			res.status(404).send(docs);
			return;
		}
		res.status(200).send(docs);
	});*/

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
		        "amounts" : {
		            "terms": {
		                "field": "Affair",
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
		//res.status(200).send(doc.hits.hits[0]._source);

		const slices = doc.aggregations.amounts.buckets;
		const totalCredit = doc.aggregations.total_amount.value;

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
