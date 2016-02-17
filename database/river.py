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

docs = []
doc = {}
toprow = rows[0]
for row in rows:
	for i,column in enumerate(row):
		doc[toprow[i]] = column
	docs.append(doc)
i = 0
for doc in docs:
	es.index(index="hvertfarapeningarnir", doc_type='tweet', body=doc)
	if i % 10000 == 0:
		print('Processing database.. ' + str(i) + ' documents created.')
	i += 1

print('Finished! ' + str(i) + ' documents created.')

res = es.search(index="hvertfarapeningarnir", body={"query": {"match_all": {}}})
print("Got %d Hits:" % res['hits']['total'])