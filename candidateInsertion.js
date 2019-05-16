const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

require('dotenv').load();
const { db, IsolationLevel } = require('./db');

async function main() {
    console.log('Resetting candidate tables');
    await db.query('DELETE FROM candidates;');
    await db.query('DELETE FROM positions;');

    console.log('Inserting candidates');

    const filePath = 'data/votingCandidates.json'
    const data = JSON.parse((await readFile(filePath)));

    const insertPositionQuery = 'INSERT INTO positions (name) VALUES ($1) RETURNING id;'
    const insertCandidateQuery = 'INSERT INTO candidates (name, position_id) VALUES ($1, $2);';
    db.transaction(IsolationLevel.ReadUncommitted, client => {
        Object.keys(data).forEach(async (positionName) => {
            console.log(`Inserting "${positionName}"`);
            const { rows: [{ id: positionId }] } = await client.query(insertPositionQuery, [positionName]);
            data[positionName] = [
                ...data[positionName],
                { name: 'Abstain' },
                { name: 'No Confidence' },
            ]
            await Promise.all(
                data[positionName].map(({ name }) => client.query(insertCandidateQuery, [name, positionId]))
            );
        });
    });
}

main().catch(err => console.error(err));