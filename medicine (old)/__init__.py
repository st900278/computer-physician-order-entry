#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import Flask, render_template, g, session, jsonify, request, redirect
import sqlite3
from random import shuffle
from time import gmtime, strftime
import os, datetime
import json
import uuid

app = Flask(__name__)
app.secret_key = os.urandom(32)
SQLITE_DB_PATH = '../medicine/db/test.db'
SQLITE_DB_SCHEMA = 'db/create_db.sql'



def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(SQLITE_DB_PATH)
    return db

def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route("/")
def main():
    if 'id' not in session:
        session['id'] = str(uuid.uuid4())


    if 'order' not in session:
        level = request.args.get('level')
        if level is None:
            return redirect("/finish")
        print "level", level

        row = query_db("select * from patients where difficulty = ?", (level, ))
        length = len(row)
        x = [ row[i][0] for i in range(length)]
        shuffle(x)
        session['order'] = x[:10]
        print 'order: ', session['order']
        session['now'] = 0

    if 'start-time' not in session:
        session['start-time'] = strftime("%Y-%m-%d %H:%M:%S")

    patientid = session['order'][session['now']]
    print "Now question: ",session['order'][session['now']]
    patient = query_db("select * from patients where id = ?", (patientid, ), True)
    allergy = query_db("select medicine from allergy where patientid = ?", (patientid, ))
    result = {}

    result['name'] = patient[1]
    result['birth'] = patient[2]
    if patient[3] == 1:
        result['gender'] = "男"
    else:
        result['gender'] = "女"
    result['age'] = patient[4]
    result['illness'] = patient[5]
    result['complaint'] = patient[6]
    session['now_patient'] = result
    session['now_patient']['allergy'] = allergy


    result['allergy'] = ', '.join([x[0] for x in allergy])

    past_illness = query_db("select * from past_ill where patientid = ? order by sick_date desc limit 2", (patientid, ))

    past_list = []
    for x in past_illness:
        medicine = query_db("select medicine from past_medicine where illid = ?", (x[0], ))
        tmp = {}
        tmp['sick_date'] = x[2]
        tmp['illness'] =  x[3]
        tmp['medicine'] = [t[0] for t in medicine]
        prohibit = query_db("select medicine from past_prohibit where illid = ?", (x[0], ))
        print prohibit
        tmp['prohibit'] = [t[0] for t in prohibit]
        past_list.append(tmp)

    print past_list

    if 'now_med' in session:
        return render_template('index.html', status = session['now']+1, patient = result, past_list = past_list, now_med=json.dumps(session['now_med']), date = datetime.date.today().strftime("%Y/%m/%d") )
    else:
        return render_template('index.html', status = session['now']+1, patient = result, past_list = past_list, date = datetime.date.today().strftime("%Y/%m/%d") )



@app.route("/check")
def check():
    if 'order' not in session:
        return redirect("/finish")
    symptoms = query_db("select alias, eng_alias from symptom_alias")
    re = {}
    for a in symptoms:
        re[a[1]] = a[0]

    # check age
    too_much = []
    if session['now_patient']['age'] >=12:
        for med in session['now_med']:
            sym_id = query_db("select symptom from symptom_alias where eng_alias = ?", (med['symptom'], ), True)
            amnt = query_db("select adult_amount from symptom_list where symptom_id = ?", (sym_id[0], ), True)
            print med['amount'], amnt[0]
            if med['amount'] != '' and float(med['amount']) > amnt[0]:
                too_much.append(med['med'])

    #check correspond
    no_correspond = []
    for med in session['now_med']:
        if med['med'] == '':
            no_correspond.append(re[med['symptom']])

    #check allergy
    med_allergy = []
    for med in session['now_med']:
        if med['med'] in session['now_patient']['allergy']:
            med_allergy.append(med['med'])


    #check same
    same_med = []
    all_med = [x['med'] for x in session['now_med']]
    same_med = list(set([i for i in all_med if all_med.count(i)>1]))


    return render_template('check.html',
                           status = session['now']+1,
                           now_med = session['now_med'],
                           alias = re,
                           too_much = ', '.join(too_much),
                           no_correspond=', '.join(no_correspond),
                           med_allergy=', '.join(med_allergy),
                           same_med=', '.join(same_med) )


@app.route("/final")
def final():
    if 'order' not in session:
        return redirect("/finish")
    symptoms = query_db("select alias, eng_alias from symptom_alias")
    re = {}
    for a in symptoms:
        re[a[1]] = a[0]

    print session['now_med']
    return render_template('prescription.html', status = session['now']+1, now_med = session['now_med'], alias = re, date = datetime.date.today().strftime("%Y/%m/%d"))




##########################################################33


@app.route("/save", methods=['GET', 'POST'])
def save():
    if request.method == 'POST':

        data = request.get_json(force=True)
        session['now_med'] = data['ill']

        return "test"

@app.route("/saveDB")
def savedb():
    print session

    db = get_db()
    for x in session['now_med']:
        db.execute('insert into participant_old (user, start_time, end_time, patientid, symptom, symptom_ch, med, amount, question_order) values (?, ?, ?, ?, ?, ?, ?, ?, ?)', (session['id'], session['start-time'], strftime("%Y-%m-%d %H:%M:%S"), session['order'][session['now']], x['symptom'], x['symptom_ch'], x['med'], x['amount'], ','.join([str(d) for d in session['order']])))
        db.commit()

    del session['now_med']
    print session['now']
    if session['now'] == 9:
        return redirect("/finish")

    session['now'] += 1

    return redirect("/")


##########################################################33

@app.route("/result")
def result():
    re = query_db("select * from participant_old")

    return render_template('result.html', result=re);

@app.route("/finish")
def finish():
    session.clear()
    return "<h3>Finish and Click to restart. <br>Level: <br><a href='/?level=1'>Simple</a><br><a href='/?level=2'>Medium</a><br><a href='/?level=3'>Hard</a>"

##########################################################33

@app.route("/symptom")
def symp():
    symptoms = query_db("select alias, eng_alias from symptom_alias")
    response = [ {'text':x[0], 'id':x[1]} for x in symptoms]
    return jsonify(symptom= response)

@app.route("/medicine")
def med():
    medicine = query_db("select name from medicine_all_list")
    response = [ {'text':x[0], 'id':x[0]} for x in medicine]
    '''
    for med in medicine:
        if med[1] in response:
            response[med[1]].append(med[0])
        else:
            response[med[1]] = [med[0]]
    '''
    return jsonify(res=response)


@app.route("/sym_alias")
def alias():
    al = query_db("select eng_alias, alias, symptom from symptom_alias")
    re = {}
    for a in al:
        re[a[0]] = {'alias': a[1], 'symptom': a[2]}
    return jsonify(alias = re)




@app.route("/now_med")
def getNowMed():
    if 'now_med' in session:
        return jsonify(session['now_med'])
    else:
        return ""
@app.route("/checkdata")
def checkdata():
    return "213"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port='5001')
