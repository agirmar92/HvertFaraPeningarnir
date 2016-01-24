#!/bin/bash          
curl -XDELETE 'localhost:9200/hvertfarapeningarnir'
curl -XPUT 'localhost:9200/hvertfarapeningarnir'
