'use strict';

// Modules:
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const os = require('os');
const api = require('./api');

// Globals:
const key  = fs.readFileSync('/ssl/server.key');
const cert = fs.readFileSync('/ssl/server.crt');
const credentials = { key: key, cert: cert }
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

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => { console.log('HTTPS Server is on port', port) });

