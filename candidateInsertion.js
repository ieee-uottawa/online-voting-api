const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

require('dotenv').load();
const { db, IsolationLevel } = require('./db');

async function main() {
    const filePath = 'data/electionPlatforms.json'
    const data = JSON.parse((await readFile(filePath)));

    const insertPositionQuery = 'INSERT INTO positions (name) VALUES ($1) RETURNING id;'
    const insertCandidateQuery = 'INSERT INTO candidates (name, position_id, platform_en, platform_fr) VALUES ($1, $2, $3, $4);';
    db.transaction(IsolationLevel.ReadUncommitted, client => {
        Object.keys(data).forEach(async (positionName) => {
            const { rows: [{ id: positionId }] } = await client.query(insertPositionQuery, [positionName]);
            data[positionName] = [
                ...data[positionName],
                { name: 'Abstain', platform: {} },
                { name: 'No Confidence', platform: {} },
            ]
            await Promise.all(
                data[positionName].map(({ name, platform: { en: enPlatform, fr: frPlatform } }) => client.query(insertCandidateQuery, [name, positionId, enPlatform, frPlatform]))
            );
        });
    });
}

main().catch(err => console.error(err));