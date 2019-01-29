const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const getFiles = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

require('dotenv').load();
const { db, IsolationLevel } = require('../db');

main();

async function main() {
    if (!(await hasMigrationTable())) {
        console.log('Creating migration table');
        await createMigrationTable();
    }

    const files = await getFiles('migrations');

    const fileRegex = /v([0-9]+)(-(.+))?\.sql/;
    db.transaction(IsolationLevel.ReadUncommitted, (client) => {
        console.log('Running migrations');
        const insertQuery = "INSERT INTO migrations VALUES($1, $2);";
        getLatestMigration().then(latestVersion => {
            Promise.all(
                files
                    .filter(fileName => {
                        if (fileName.endsWith('.sql')) {
                            const [, version] = fileRegex.exec(fileName);
                            return version > latestVersion;
                        }
                        return false;
                    })
                    .map(async fileName => {
                        const [, version, , name] = fileRegex.exec(fileName);
                        console.log('Running migration ' + version);
                        client.query(((await readFile(path.join(__dirname, fileName))).toString()));
                        client.query(insertQuery, [name, version]);
                    })
            );
        });
    });
}

async function createMigrationTable() {
    await db.query('CREATE TABLE migrations(name TEXT, version INTEGER NOT NULL UNIQUE);')
}

async function hasMigrationTable() {
    const { rows: [{ exists }] } = await db.query("SELECT EXISTS(SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'migrations');");
    return exists;
}

async function getLatestMigration() {
    const { rows: [{ version }] } = await db.query('SELECT MAX(version) AS version FROM migrations;');
    return version;
}
