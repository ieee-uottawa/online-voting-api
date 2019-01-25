const { Pool } = require('pg')

// pools will use environment variables
// for connection information
const db = new Pool();

module.exports.getCandidates = async () => {
    const { rows } = await db.query('SELECT c.id, c.name, p.name AS position, c.platform FROM candidates c JOIN positions p ON c.position_id = p.id;');
    return rows.reduce((obj, row) => {
        const key = row.position;
        const arr = obj[key] || [];
        delete row[key];

        arr.push(row);
        obj[key] = arr;

        return obj;
    }, {});
};

module.exports.submitVote = async (email, candidateIDs) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;');

        const updateQuery = 'UPDATE candidates SET votes = (SELECT votes FROM candidates WHERE id = $1) + 1 WHERE id = $1;';
        candidateIDs.forEach(async (id) => {
            await db.query(updateQuery, [id]);
        });

        await client.query('UPDATE valid_users SET has_voted = TRUE WHERE email = $1;', [email]);
        await client.query('COMMIT;');
    } catch (e) {
        await client.query('ROLLBACK;');
        throw e;
    } finally {
        client.release();
    }
};