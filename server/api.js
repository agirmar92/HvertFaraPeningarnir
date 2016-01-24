'use strict';

// Modules
const express = require('express');
const bodyParser = require('body-parser');

// Globals
const api = express();

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
	res.status(200).send('This is a message from the server.');
});

module.exports = api;