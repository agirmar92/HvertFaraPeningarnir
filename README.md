# HvertFaraPeningarnir

Lokaverkefni

### To run:

You must have the following installed on your machine:

- git 
- python
- npm
- node 4
- nodemon

1. Run  `./initScript.sh` to install dependencies.

2. Run `./startElastic.sh` to start ElasticSearch database and run it.

3. Run `./restartElastic.sh` to clear the ElasticSearch database.

4. Run `./startServer.sh` to start up the server.

5. Run `./startClient.sh` to start up the client.

6. Visit `localhost:8000` in your favorite browser.

### Operations

- HTTPS renewal and production container recreation are documented in [ops/HTTPS_RENEWAL.md](ops/HTTPS_RENEWAL.md).
- Production server architecture, legacy constraints, and remote-host pitfalls are documented in [ops/PRODUCTION_SERVER.md](ops/PRODUCTION_SERVER.md).
- The shared runtime config pattern for live container names and image tags is documented in [ops/hfp-runtime.conf.example](ops/hfp-runtime.conf.example).
