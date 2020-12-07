//Database

const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:julian:pet@localhost:5432/petition");
//("WhoAreWeTalkingTo:WichDBuserWillRunCommands:TheUserPassword@WhichPort/nameOfDatabase")

module.exports.getUsers = () => {
    const q = `SELECT * FROM signatures`; //SELECT * FROM users WHERE!!!!!!!!!!!!!!!!!!!
    return db.query(q);
};

module.exports.newUser = (first, last, email, password) => {
    const q = `INSERT INTO users (first, last, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id `;
    const params = [first, last, email, password];
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

module.exports.getCount = () => {
    const q = `SELECT COUNT (*) FROM signatures`;
    return db.query(q);
};
