#!/usr/bin/env python3
import json
from datetime import datetime
import pypyodbc
from getpass import getpass
import csv
from elasticsearch import Elasticsearch
from pprint import pprint
import time
import certifi
import argparse
import subprocess
import os

parser = argparse.ArgumentParser()
parser.add_argument("--e", dest="encoding", default="utf-16", help="Use if you want to used utf8 encoding when reading from ../results.csv. Default = utf-16")
parser.add_argument("host", help="Host address of elasticsearch")
parser.add_argument("port", help="Port of elasticsearch instance")
parser.add_argument("index", help="The index to update")
args = parser.parse_args()

script_args = args.host + ' ' + args.port + ' ' + args.index

# Runs a bash script that deletes and creates a new index in elasticsearch for the year specified by the user
createIndex = "/bin/bash updateIndex.sh " + script_args
os.system(createIndex)

es = Elasticsearch(
	[args.host + ':' + args.port],
	port=args.port,
	verify_certs=True,
	ca_certs=certifi.where(),
)

# Open the huge csv file and read from it
rows = []
with open('../results.csv', encoding=args.encoding) as infile:
	readr = csv.reader(infile, delimiter=';')
	for x in readr:
		rows.append([ y.strip() for y in x ])

# The first row - header columns
fileCols = rows[0]

# Convert to a list of dictionaries
docs = []
cols = {
	'Date': 'Mánuður',
	'AffairID': 'Málaflokkur kóti',
	'DepartmentID': 'Deildarkóti',
	'FinanceKeyID': 'FjárhagslykillNr',
	'Amount': 'Upphæð',
	'FinanceKey': 'Fjárhagslykill',
	'PrimaryFinanceKey': 'Yfirfjárhagslykill',
	'SecondaryFinanceKey': 'Millifjárhagslykill',
	'Department': 'Málaflokkur-Deild',
	'Affair': 'Málaflokkur',
	'Creditor': 'Lánardrottinn',
	'CreditorID': 'Lánardrottnanúmer',
	'DepartmentGroup': 'Millideild',
	'AffairGroup': 'Yfirmálaflokkur'
}

for row in rows[1:]:
	doc = {}
	for col in cols:
		keyIndex = fileCols.index(cols[col])
		doc[col] = row[keyIndex]
	docs.append(doc)

# DEPRECATED!
# for row in rows[2:-2]:
# 	doc = {}
# 	for i, column in enumerate(row):
# 		doc[cols[i]] = column
# 	docs.append(doc)


# Process dictionaries into ElasticSearch
for i, doc in enumerate(docs):
	#print(str(i) + ': ' + str(doc['Amount']))
	es.index(index=args.index, doc_type='doc', body=doc)
	if i % 10000 == 0:
		print('Processing database.. ' + str(i) + ' documents created.')
print('Finished! ' + str(len(docs)) + ' documents created.')

# Query the database, just for fun
time.sleep(2)
res = es.search(index=args.index, body={"query": {"match_all": {}}})
print("Got %d Hits:" % res['hits']['total'])

