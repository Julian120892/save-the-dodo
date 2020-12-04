DROP TABLE IF EXISTS signatures;

 CREATE TABLE signatures (
     id SERIAL PRIMARY KEY,
     first VARCHAR NOT NULL CHECK (first != ''),
     last VARCHAR NOT NULL CHECK (last != ''),
     signature VARCHAR NOT NULL CHECK (signature != '')
 );

 INSERT INTO signatures (first, last, signature) VALUES ('julian', 'richberg', 'sdadad');
 INSERT INTO signatures (first, last, signature) VALUES ('Another', 'Testname', 'ssdfsf');


SELECT first AS "first Name", last AS "Last Name"
FROM signatures;

SELECT * FROM signatures;