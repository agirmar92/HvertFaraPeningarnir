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

parser = argparse.ArgumentParser()
parser.add_argument("password", help="You know passwords right?")
args = parser.parse_args()

user = 'admin'
pswd = args.password

es = Elasticsearch(
	['http://eca51012e819d5eb6403e0765dcd91b9.eu-west-1.aws.found.io'],
	http_auth=(user, pswd),
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
#cols = [ 'Date', 'Division', 'DepartmentID', 'Department', 'Unused1', 'AffairID', 'Affair', 'Unused2', 'Unused3', 'Creditor', 'PrimaryFinanceKey', 'FinanceKeyID', 'FinanceKey', 'Amount' ]
cols = rows[0]

for row in rows[2:-2]:
	doc = {}
	for i, column in enumerate(row):
		if i == len(row)-1:
			column = column.split('.', 1)[0]
			if column == '':
				column = '0'
		doc[cols[i]] = column
	docs.append(doc)

# Process dictionaries into ElasticSearch
for i, doc in enumerate(docs):
	es.index(index="hvertfarapeningarnir", doc_type='doc', body=doc)
	if i % 10000 == 0:
		print('Processing database.. ' + str(i) + ' documents created.')
print('Finished! ' + str(len(docs)) + ' documents created.')

# Query the database, just for fun
time.sleep(2)
res = es.search(index="hvertfarapeningarnir", body={"query": {"match_all": {}}})
print("Got %d Hits:" % res['hits']['total'])

