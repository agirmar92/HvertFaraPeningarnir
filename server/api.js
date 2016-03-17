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
		index: 'hfp'
	}).then((doc) => {
		//res.status(200).send(doc.hits.hits[0]._source);
		res.status(200).send(doc);
	}, (err) => {
		console.log(err);
		res.status(500).send('Server error\n');
	});

});

module.exports = api;
