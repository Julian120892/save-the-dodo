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

module.exports.addUserData = (firstName, lastName) => {
    const q = `INSERT INTO petition (first, last) VALUES ($1, $2)`;
    const params = [firstName, lastName];

    return db.query(q, params);
};
