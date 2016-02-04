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

with open('results-2.txt') as infile:
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
print(len(docs))
for i in range(5):
	pprint(docs[i])



#with open('data.json', 'w') as outfile:
#	json.dump(rows, outfile)

