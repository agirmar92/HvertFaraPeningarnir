'use strict';

// Modules
const express = require('express');
const bodyParser = require('body-parser');
const elasticsearch = require('elasticsearch');

// Globals
const api = express();
const cluster = 'http://localhost:9200/ClusterForPunchy/';
const elasticClient = new elasticsearch.Client({
	host: 'http://hfpserver.westeurope.cloudapp.azure.com:9200'
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
		index: 'hvertfarapeningarnir'
	}).then((doc) => {
		//res.status(200).send(doc.hits.hits[0]._source);
		res.status(200).send(doc);
	}, (err) => {
		console.log(err);
		res.status(500).send('Server error\n');
	});

});

module.exports = api;