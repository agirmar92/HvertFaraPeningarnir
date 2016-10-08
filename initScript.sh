#!/bin/bash

echo "---------------------------"
echo "Installing dependencies for client"

cd client
npm install
npm install -g live-server

cd ..

echo "---------------------------"
echo "Installing dependencies for server"

cd server
npm install

cd ..

echo "---------------------------"
echo "DONE"

