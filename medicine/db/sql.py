#!/usr/bin/python
# -*- coding: utf-8 -*-

import sqlite3 as lite
import sys

f = open("difficult.txt", 'r').read()

datas = f.split("\n")

print len(datas)

con = lite.connect('test.db')
with con:
	#cur = con.cursor()
	num = 121
	ill_id = 1
	for data in datas:
		if data == '':break
		data = data[:-1]
		name, birth, gender, age, ill, complain, symptoms, allergies, first, second= data.split(";")
		#print name, birth, gender, age, ill, complain
		
		patient = "insert into patients values("+str(num)+",'"+name+"','"+birth+"',"+gender+","+age+",'"+ill+"','"+complain+"', 3)"
		#print patient
		#cur.execute(patient)
		
		sym = symptoms[1:-1].split(",")
		for y in sym:
			s =  "insert into now_ill(patientid, symptom) values("+str(num)+",'"+y+"')"
			#print s
			#cur.execute(s)
		
		al = allergies[1:-1].split(",")
		for y in al:
			s =  "insert into allergy(patientid, medicine) values("+str(num)+",'"+y+"')"
			#print s
			#cur.execute(s)
			
		x = first.split("[")
		if len(x) == 2:
			date, ill,_ = x[0].split(",")
			past_med = x[1][:-1].split(",")
			s =  "insert into past_ill(id, patientid, sick_date, illness) values("+str(ill_id)+","+str(num)+",'"+date+"','"+ill+"')"
			#print s
			cur.execute(s)
			for u in past_med:
				r = "insert into past_medicine(illid, medicine) values("+str(ill_id)+",'"+u+"')"
				#print r
				#cur.execute(r)
			
			
		elif len(x) == 3:
			print x
			date, ill,_ = x[0].split(",")
			past_med = x[1][:-2].split(",")
			past_pro = x[2][:-1].split(",")
			
			s =  "insert into past_ill(id, patientid, sick_date, illness) values("+str(ill_id)+","+str(num)+",'"+date+"','"+ill+"')"
			#print s
			cur.execute(s)
			for u in past_med:
				r = "insert into past_medicine(illid, medicine) values("+str(ill_id)+",'"+u+"')"
				#print r
				cur.execute(r)
			for u in past_pro:
				r = "insert into past_prohibit(illid, medicine) values("+str(ill_id)+",'"+u+"')"
				#print r
				cur.execute(r)
		ill_id += 1
		
		x = second.split("[")
		if len(x) == 2:
			date, ill,_ = x[0].split(",")
			past_med = x[1][:-1].split(",")
			s =  "insert into past_ill(id, patientid, sick_date, illness) values("+str(ill_id)+","+str(num)+",'"+date+"','"+ill+"')"
			#print s
			cur.execute(s)
			for u in past_med:
				r = "insert into past_medicine(illid, medicine) values("+str(ill_id)+",'"+u+"')"
				#print r
				cur.execute(r)
			
			
		elif len(x) == 3:
			date, ill,_ = x[0].split(",")
			past_med = x[1][:-2].split(",")
			past_pro = x[2][:-1].split(",")
			s =  "insert into past_ill(id, patientid, sick_date, illness) values("+str(ill_id)+","+str(num)+",'"+date+"','"+ill+"')"
			#print s
			cur.execute(s)
			for u in past_med:
				r = "insert into past_medicine(illid, medicine) values("+str(ill_id)+",'"+u+"')"
				#print r
				cur.execute(r)
			for u in past_pro:
				r = "insert into past_prohibit(illid, medicine) values("+str(ill_id)+",'"+u+"')"
				#print r
				cur.execute(r)
		ill_id += 1
		
		
		num += 1
		



'''

with con:
    
    cur = con.cursor()    
    
    cur.execute("DROP TABLE IF EXISTS Cars")
    cur.execute("CREATE TABLE Cars(Id INT, Name TEXT, Price INT)")
    cur.executemany("INSERT INTO Cars VALUES(?, ?, ?)", cars)

'''
