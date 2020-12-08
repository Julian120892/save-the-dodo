DROP TABLE IF EXISTS users;

   CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      first VARCHAR(255) NOT NULL,
      last VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

DROP TABLE IF EXISTS signatures;

 CREATE TABLE signatures(
      id SERIAL PRIMARY KEY,
      signature TEXT NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );


DROP TABLE IF EXISTS user_profiles;

CREATE TABLE user_profiles(
  id SERIAL PRIMARY KEY,
  age INT,
  city VARCHAR(255),
  url VARCHAR(255),
  user_id INT NOT NULL REFERENCES users(id)
);



/*create Test Data*/
INSERT INTO users (first, last, email, password)
VALUES ('julian', 'richberg', 'jr@mail.de' , 'password');

INSERT INTO user_profiles (age, city, url, user_id)
VALUES (28, 'berlin', 'https://website.de' , 1);

INSERT INTO signatures (signature, user_id)
VALUES ('testsignature', 1);

/*create more Table Data*/
INSERT INTO users (first, last, email, password)
VALUES ('john', 'wayne', 'jw@mail.de' , '1234');

INSERT INTO user_profiles (age, city, url, user_id)
VALUES (71, 'berlin', 'https://johnwayne-website.de' , 2);

INSERT INTO signatures (signature, user_id)
VALUES ('anothertestsignature', 2);

/*Show tables*/
SELECT * FROM users;
SELECT * FROM user_profiles;
SELECT * FROM signatures;


/*Select signers Data from joined table*/
SELECT
users.first,
users.id,
users.last,
user_profiles.age,
user_profiles.city,
user_profiles.url,
user_profiles.user_id
FROM
signatures
INNER JOIN users ON users.id = signatures.user_id
INNER JOIN user_profiles ON user_profiles.user_id = users.id;
