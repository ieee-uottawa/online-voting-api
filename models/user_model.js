const { db } = require('../db');

module.exports.hasUserVoted = async (email) => {
    const { rows } = await db.query('SELECT id FROM voted_users WHERE email = $1;', [email]);
    return rows.length === 1;
};
