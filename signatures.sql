DROP TABLE IF EXISTS signatures;

 CREATE TABLE signatures (
     id SERIAL PRIMARY KEY,
     first VARCHAR NOT NULL CHECK (first != ''),
     last VARCHAR NOT NULL CHECK (last != '')
 );

 INSERT INTO signatures (first, last) VALUES ('julian', 'richberg');
 INSERT INTO signatures (first, last) VALUES ('Another', 'Testname');


SELECT first AS "first Name", last AS "Last Name"
FROM signatures;

SELECT * FROM signatures;