//Database

const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:julian:pet@localhost:5432/petition");
//("WhoAreWeTalkingTo:WichDBuserWillRunCommands:TheUserPassword@WhichPort/nameOfDatabase")

module.exports.getUsers = () => {
    const q = `SELECT * FROM signatures`;
    return db.query(q);
};

module.exports.getCount = () => {
    const q = `SELECT COUNT (*) FROM signatures`;
    return db.query(q);
};

module.exports.addUserData = (firstName, lastName, signature) => {
    const q = `
    INSERT INTO signatures (first, last, signature) 
    VALUES ($1, $2, $3)
    RETURNING id
    `;
    const params = [firstName, lastName, signature];

    return db.query(q, params);
};

module.exports.getUserSignature = (id) => {
    const q = `
    SELECT signature 
    FROM signatures
    WHERE id = '${id}'
    `;
    return db.query(q);
};
