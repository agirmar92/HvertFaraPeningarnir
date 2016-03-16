#!/bin/bash
if [ $# == 0 ]; then
  read -s -p "Password: " PASS
else
  PASS=$1
fi
#curl -XDELETE 'http://hfp.northeurope.cloudapp.azure.com:9200/hfp'
#curl -XPUT    'http://hfp.northeurope.cloudapp.azure.com:9200/hfp'
