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
parser.add_argument("year", help="The year you are going to update.")
args = parser.parse_args()

user = 'admin'
year = args.year

# Runs a bash script that deletes and creates a new index in elasticsearch for the year specified by the user
createIndex = "/bin/bash updateYear.sh " + year
os.system(createIndex)

es = Elasticsearch(
	['http://hfp.northeurope.cloudapp.azure.com:9200'],
	#http_auth=(user, pswd),
	port=9200,
	verify_certs=True,
	ca_certs=certifi.where(),
)

# Open the huge csv file and read from it
rows = []
with open('../results.csv', encoding='utf-16') as infile:
	readr = csv.reader(infile, delimiter=';')
	for x in readr:
		rows.append([ y.strip() for y in x ])

# Convert to a list of dictionaries
docs = []
cols = [ 'Date', 'AffairID', 'DepartmentID', 'FinanceKeyID', 'Amount', 'FinanceKey', 'PrimaryFinanceKey', 'SecondaryFinanceKey', 'Department', 'Affair', 'Creditor', 'DepartmentGroup', 'AffairGroup' ]
#cols = rows[0]

for row in rows[2:-2]:
	doc = {}
	for i, column in enumerate(row):
		doc[cols[i]] = column
	docs.append(doc)


# Process dictionaries into ElasticSearch
for i, doc in enumerate(docs):
	#print(str(i) + ': ' + str(doc['Amount']))
	es.index(index='hfp-' + year, doc_type='doc', body=doc)
	if i % 10000 == 0:
		print('Processing database.. ' + str(i) + ' documents created.')
print('Finished! ' + str(len(docs)) + ' documents created.')

# Query the database, just for fun
time.sleep(2)
res = es.search(index='hfp-' + year, body={"query": {"match_all": {}}})
print("Got %d Hits:" % res['hits']['total'])

