const { db } = require('../db');

module.exports.hasUserVoted = async (email) => {
    const { rows: [{ has_voted: hasVoted }] } = await db.query('SELECT has_voted FROM valid_users WHERE email = $1;', [email]);
    return hasVoted;
};

module.exports.canUserVote = async (email) => {
    const { rows } = await db.query('SELECT id FROM valid_users WHERE email = $1;', [email]);
    return rows.length === 1;
};
