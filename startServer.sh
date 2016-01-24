#!/bin/bash          
cd server
BASEDIR=$(dirname $0)
$BASEDIR/node_modules/nodemon/bin/nodemon.js index.js