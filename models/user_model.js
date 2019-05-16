const { db } = require('../db');

module.exports.hasUserVoted = async (email) => {
    const { rows } = await db.query('SELECT id FROM voted_users WHERE email = $1;', [email]);
    return rows.length === 1;
};

module.exports.isValidUser = async (email) => {
    if (Boolean(process.env.VALIDATE_USERS)) {
        const { rows } = await db.query('SELECT id FROM valid_users WHERE email = $1', [email]);
        return rows.length === 1;
    }

    return true;
}
