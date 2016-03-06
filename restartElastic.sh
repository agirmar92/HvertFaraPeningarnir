#!/bin/bash
if [ $# == 0 ]; then
  read -s -p "Password: " PASS
else
  PASS=$1
fi
curl -XDELETE 'http://hfpserver.westeurope.cloudapp.azure.com:9200/hvertfarapeningarnir'
curl -XPUT    'http://hfpserver.westeurope.cloudapp.azure.com:9200/hvertfarapeningarnir'
