//Database

const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");
//("WhoAreWeTalkingTo:WichDBuserWillRunCommands:TheUserPassword@WhichPort/nameOfDatabase")

module.exports.getFirstName = () => {
    return db.query(`SELECT first_name FROM petition`);
};

module.exports.addName = (firstName, lastName) => {
    const q = `INSERT INTO petition (first, last) VALUE ($1, $2)`;
    const params = [firstName, lastName];

    return db.query(q, params);
};
