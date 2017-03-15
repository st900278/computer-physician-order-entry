
import sqlite3 as lite
import sys

f = open("../test/tmp.txt", 'r').read()

f = f.upper()

datas = f.split("\n")[:-1]

print len(datas)

con = lite.connect('test.db')

with con:
    cur = con.cursor()
    for data in datas:
        if "'" in data:
            data = data.replace("'", "''")
            
        cur.execute("insert into medicine_all_list (name) values ('"+data+"')")