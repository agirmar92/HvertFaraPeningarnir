'use strict';

// Modules:
const express = require('express');
const api = require('./api');

// Globals:
const app = express();
const port = 4000;

app.use((req, res, next) => {
	const data = {
		timestamp: new Date(),
		method: req.method,
		headers: req.headers,
		path: req.path,
	};

	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

	next();
});

app.use('/', api.api);

app.listen(port, () => {
	console.log('Server is on port', port);
});

/* Connect to MongoDB
mongoose.connect('localhost/clipper');
mongoose.connection.once('open', function() {
	console.log('mongoose is connected');
	app.listen(port, () => {
		console.log('Server is on port', port);
	});
});
*/
