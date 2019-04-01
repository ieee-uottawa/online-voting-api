const { db, IsolationLevel } = require('../db');

module.exports.getCandidates = async () => {
    const { rows } = await db.query('SELECT c.id, c.name, p.name AS position FROM candidates c JOIN positions p ON c.position_id = p.id ORDER BY p.id, c.id;');
    return rows.reduce((obj, row) => {
        const key = row.position;
        const arr = obj[key] || [];
        // delete row[key];

        arr.push(row);
        obj[key] = arr;

        return obj;
    }, {});
};

module.exports.submitVote = async (email, candidateIDs) => {
    db.transaction(IsolationLevel.Serializable, async (client) => {
        const updateQuery = 'UPDATE candidates SET votes = (SELECT votes FROM candidates WHERE id = $1) + 1 WHERE id = $1;';
        candidateIDs.forEach(async (id) => {
            await client.query(updateQuery, [id]);
        });

        await client.query('INSERT INTO voted_users (email) VALUES ($1);', [email]);
    });
};