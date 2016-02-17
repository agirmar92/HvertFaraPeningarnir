#!/usr/bin/env python3
import json
from datetime import datetime
import pypyodbc
from getpass import getpass
import csv
from elasticsearch import Elasticsearch
from pprint import pprint

es = Elasticsearch()
rows = []

with open('results-3.csv', encoding='utf-16') as infile:
	readr = csv.reader(infile, delimiter=';')
	for x in readr:
		rows.append([ y.strip() for y in x ])
	print('hér!!!')

docs = []
doc = {}
toprow = rows[0]
for row in rows:
	for i,column in enumerate(row):
		doc[toprow[i]] = column
	docs.append(doc)

for doc in docs:
	es.index(index="hvertfarapeningarnir", doc_type='tweet', body=doc)

print('Finished!')

res = es.search(index="hvertfarapeningarnir", body={"query": {"match_all": {}}})
print("Got %d Hits:" % res['hits']['total'])