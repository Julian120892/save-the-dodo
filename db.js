//Database

const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL || "postgres:julian:pet@localhost:5432/petition"
);
//("WhoAreWeTalkingTo:WichDBuserWillRunCommands:TheUserPassword@WhichPort/nameOfDatabase")

module.exports.getUsers = () => {
    const q = `
        SELECT
        users.first,
        users.last,
        user_profiles.age,
        user_profiles.city,
        user_profiles.url
        FROM
        signatures
        JOIN users ON users.id = signatures.user_id
        JOIN user_profiles ON user_profiles.user_id = users.id;
    `;
    return db.query(q);
};

module.exports.getUserFromCity = (city) => {
    const q = `
        SELECT
        users.first,
        users.last,
        user_profiles.age,
        user_profiles.city,
        user_profiles.url
        FROM
        signatures
        JOIN users ON users.id = signatures.user_id
        JOIN user_profiles ON user_profiles.user_id = users.id
        AND user_profiles.city = '${city}'
    `;
    return db.query(q);
};

module.exports.getUserId = (email) => {
    const q = `
    SELECT
    id
    FROM
    users
    WHERE email = '${email}'
    `;
    return db.query(q);
};

module.exports.newUser = (first, last, email, password) => {
    const q = `INSERT INTO users (first, last, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id `;
    const params = [first, last, email, password];
    return db.query(q, params);
};

module.exports.updatePasswortAndUser = (id, first, last, email, hash) => {
    const q = `
    UPDATE users
    SET first = $2, last = $3, email = $4, password = $5
    WHERE id = $1;
    `;
    const params = [id, first, last, email, hash];
    return db.query(q, params);
};

module.exports.updateUser = (id, first, last, email) => {
    const q = `
    UPDATE users
    SET first = $2, last = $3, email = $4
    WHERE id = $1;
    `;
    const params = [id, first, last, email];
    return db.query(q, params);
};

module.exports.LogIn = (email) => {
    const q = `
    SELECT password
    FROM users
    WHERE email = '${email}'
    `;
    return db.query(q);
};

module.exports.addUserSig = (signature, user_id) => {
    const q = `
    INSERT INTO signatures (signature, user_id)
    VALUES ($1, $2)
    RETURNING user_id
    `;
    const params = [signature, user_id];
    return db.query(q, params);
};

module.exports.getUserSignature = (user_id) => {
    const q = `
    SELECT signature
    FROM signatures
    WHERE user_id = '${user_id}'
    `;
    return db.query(q);
};

module.exports.deleteSignature = (user_id) => {
    const q = `
    DELETE FROM signatures
    WHERE user_id = '${user_id}'
    `;
    return db.query(q);
};

module.exports.getCount = () => {
    const q = `SELECT COUNT (*) FROM signatures`;
    return db.query(q);
};

module.exports.addUserData = (age, city, url, id) => {
    const q = `
    INSERT INTO user_profiles (age, city, url, user_id)
    VALUES ($1, $2, $3, $4)
    `;
    const params = [age, city, url, id];
    return db.query(q, params);
};

module.exports.updateUserProfile = (age, city, url, user_id) => {
    const q = `
    INSERT INTO user_profiles (age, city, url, user_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO 
    UPDATE SET age = $1, city = $2, url = $3
    `;
    const params = [age, city, url, user_id];
    return db.query(q, params);
};
module.exports.getSpecificUser = (id) => {
    const q = `
        SELECT
        users.first,
        users.last,
        users.email,
        user_profiles.age,
        user_profiles.city,
        user_profiles.url
        FROM
        users
        JOIN user_profiles ON user_profiles.user_id = users.id
        AND user_id = ${id};
    `;
    return db.query(q);
};
