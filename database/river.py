#!/usr/bin/env python3
import json
from datetime import datetime
import pypyodbc
from getpass import getpass
import csv
from elasticsearch import Elasticsearch
from pprint import pprint
import time

es = Elasticsearch()

# Open the huge csv file and read from it
rows = []
with open('results-3.csv', encoding='utf-16') as infile:
	readr = csv.reader(infile, delimiter=';')
	for x in readr:
		rows.append([ y.strip() for y in x ])

# Convert to a list of dictionaries
docs = []
toprow = rows[0]
for row in rows[2:-2]:
	doc = {}
	for i, column in enumerate(row):
		doc[toprow[i]] = column
	docs.append(doc)

# Process dictionaries into ElasticSearch
for i, doc in enumerate(docs):
	es.index(index="hvertfarapeningarnir", doc_type='db_entry', body=doc)
	if i % 10000 == 0:
		print('Processing database.. ' + str(i) + ' documents created.')
print('Finished! ' + str(len(docs)) + ' documents created.')

# Query the database, just for fun
time.sleep(2)
res = es.search(index="hvertfarapeningarnir", body={"query": {"match_all": {}}})
print("Got %d Hits:" % res['hits']['total'])

