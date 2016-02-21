#!/bin/bash
if [ $# == 0 ]; then
  read -s -p "Password: " PASS
else
  PASS=$1
fi
curl -XDELETE 'http://eca51012e819d5eb6403e0765dcd91b9.eu-west-1.aws.found.io:9200/hvertfarapeningarnir' --user "admin:$PASS"
curl -XPUT 'http://eca51012e819d5eb6403e0765dcd91b9.eu-west-1.aws.found.io:9200/hvertfarapeningarnir' --user "admin:$PASS"
