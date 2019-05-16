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

    let filePath = 'data/votingCandidates.json';
    let data = JSON.parse((await readFile(filePath)));

    const insertPositionQuery = 'INSERT INTO positions (name) VALUES ($1) RETURNING id;'
    const insertCandidateQuery = 'INSERT INTO candidates (name, position_id) VALUES ($1, $2);';
    db.transaction(IsolationLevel.ReadUncommitted, (client) => {
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

    if (Boolean(process.env.VALIDATE_USERS)) {
        console.log('Resetting valid voter table');
        await db.query('DELETE FROM valid_users;');

        filePath = 'data/voters.json';
        data = JSON.parse((await readFile(filePath)));

        const insertUserQuery = 'INSERT INTO valid_users (email) VALUES ($1);';
        db.transaction(IsolationLevel.ReadUncommitted, async (client) => {
            console.log('Inserting valid voters');
            await Promise.all(data.map(email => client.query(insertUserQuery, [email])));
        });
    }
}

main().catch(err => console.error(err));