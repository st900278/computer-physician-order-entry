CREATE TABLE patients (
    id INTEGER PRIMARY KEY ASC AUTOINCREMENT,
    name TEXT NOT NULL,
    birth DATE,
    gender INTEGER,
    age INTEGER,
    illness TEXT,
    complaint TEXT

);

CREATE TABLE now_ill (
    id INTEGER PRIMARY KEY ASC AUTOINCREMENT,
    patientid INTEGER,
    indication TEXT,
    medicine TEXT,    
    FOREIGN KEY (patientid) REFERENCES patients(id)
);

CREATE TABLE allergy (
    id INTEGER PRIMARY KEY ASC AUTOINCREMENT,
    patientid INTEGER,
    medicine TEXT,
    FOREIGN KEY (patientid) REFERENCES patients(id)
);

CREATE TABLE past_ill (
    id INTEGER PRIMARY KEY ASC AUTOINCREMENT,
    patientid INTEGER,
    sick_date DATE,
    illness TEXT,
    FOREIGN KEY (patientid) REFERENCES patients(id)
);

CREATE TABLE past_medicine (
    id INTEGER PRIMARY KEY ASC AUTOINCREMENT,
    illid INTEGER,
    medicine TEXT,
    FOREIGN KEY (illid) REFERENCES past_ill(id)
);

























