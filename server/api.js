'use strict';

// Modules
const express = require('express');
const bodyParser = require('body-parser');
const elasticsearch = require('elasticsearch');

// Globals
const api = express();
const cluster = 'http://localhost:9200/ClusterForPunchy/';
const elasticClient = new elasticsearch.Client({
	host: 'localhost:9200'
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

	// Save to Elastic Search
	elasticClient.index({
		'index' : 'hvertfarapeningarnir',
		'type'  : 'test',
		'body'  : {
			'name' : 'leikskólinn playplay',
			'expenses' : 1000000,
			'income' : 500000,
			'special-income' : 500000
		}
	}).then((respo) => {
		console.log('inserted to elastic:' + respo)
	},(error) => {
		res.status(500).send('Server error (elastic).\n');
		return;
	});

	setTimeout(function() {
		elasticClient.search({
			'index'  : 'hvertfarapeningarnir',
			'type'   : 'test',
		}).then((doc) => {
			res.status(200).send(doc);
		}, (err) => {
			res.status(500).send('Server error\n');
		});
	}, 1000);
	
});

module.exports = api;