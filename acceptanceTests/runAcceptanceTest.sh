#!/bin/bash -e
echo "STARTING LOCAL TEST CLIENT (port 8000)"
echo "==========================="
cd ..
# Replacing the route to where the client call the API (from production to test)
sed -i 's/hfp.northeurope.cloudapp.azure.com:4000/localhost:4040/g' client/js/constants/hfpConstants.js
# Kill all jobs on port 8000 (if any)
if fuser 8000/tcp ; then
    fuser -k 8000/tcp
fi
# Start a simple HTTP server (ignore output)
nohup ./startClient.sh &

echo "STARTING LOCAL TEST API (port 4040)"
echo "==========================="
# Replacing the port of the API (from production to test)
sed -i 's/4000/4040/g' server/index.js
# Kill all jobs on port 4040 (if any)
if fuser 4040/tcp ; then
    fuser -k 4040/tcp
fi
# Start up an instance of the API (ignore output)
nohup ./startServer.sh &

echo "STARTING SELENIUM STANDALONE SERVER (port 4444)"
echo "==========================="
# Kill all jobs on port 4444 (if any)
if fuser 4444/tcp ; then
    fuser -k 4444/tcp
fi
# Start up a selenium standalone server
DISPLAY=:0 java -jar /home/esja/selenium-server-standalone-2.53.0.jar &

echo "RUNNING ACCEPTANCE TESTS ON HEADLESS FIREFOX INSTANCE"
echo "==========================="
cd acceptanceTests
# Run the actual tests
python3 acceptanceTest.py

# Remove all jobs started by this script
echo "KILLING EVERYTHING, WE ARE DONE AND SYSTEM IS READY FOR DEPLOYMENT"
echo "==========================="
fuser -k 4444/tcp
fuser -k 8000/tcp
fuser -k 4040/tcp
