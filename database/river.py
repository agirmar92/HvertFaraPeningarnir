#!/usr/bin/env python3
import json
from datetime import datetime
import pypyodbc
from getpass import getpass

pw = getpass()
print('password is:' + pw)

connection_string = 'Driver={SQL Server};Server=192.168.100.99;Database=KOP-LIND;Uid=aegirmar;Pwd=' + str(pw) + ';'
conn = pypyodbc.connect(connection_string)
c = conn.cursor()
print('connected!')
# TODO: breyta í rétta önn
'''
c.execute("""
		SELECT *
		FROM 
		""")
rows = c.fetchall()
print(rows[0])
'''
conn.close()

'''
grades = {}
grade_sum = {}
countr = {}
majors = {}
for x in rows:
	if x[0] in grade_sum:
		grade_sum[x[0]] += x[2]
		countr[x[0]] += 1
		grades[x[0]] += ', ' + str(x[2])
	else:
		grade_sum[x[0]] = x[2]
		countr[x[0]] = 1
		grades[x[0]] = str(x[2])
		majors[x[0]] = x[1]
avg_and_grades = []
for k, v in grade_sum.items():
	avg = v / countr[k]
	avg_and_grades.append(( k, majors[k], grades[k], avg ))
deans = sorted(avg_and_grades, key=lambda x: float(x[3]), reverse=True)
deans_list = [ ( x[0], x[1], x[2], "%.2f" % x[3] ) for x in deans ]

now = datetime.now()
date = str(now)[:10]
converted_date = date[8:] + '/' + date[5:7] + '/' + date[:4]
date_and_time = converted_date + ' kl. ' + str(now)[11:19]

# skrifa nuid i skra:
with open('deans_list/now.json', encoding='utf-8', mode='w') as n:
	json.dump(date_and_time, n)
with open('deans_list/db.json', encoding='utf-8', mode='w') as d:
	json.dump(deans_list, d)
'''