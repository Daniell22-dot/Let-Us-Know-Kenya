/**
 * DESTRUCTIVE. Drops and recreates the entire `public` schema, which deletes
 * every table, row and enum type in the database.
 *
 * Safety rails added:
 *  - Only runs when executed directly (`node drop_tables.js`). Previously the
 *    function was invoked at module scope, so merely `require`-ing this file
 *    destroyed the database.
 *  - Requires NODE_ENV to be non-production AND the explicit --force flag.
 *  - Requires interactive confirmation unless --yes is passed.
 */
require('dotenv').config();

const sequelize = require('./config/db.config');

async function resetSchema() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();

        console.log('Dropping and recreating public schema...');
        await sequelize.query('DROP SCHEMA public CASCADE;');
        await sequelize.query('CREATE SCHEMA public;');
        await sequelize.query('GRANT ALL ON SCHEMA public TO public;');

        console.log('Schema reset successfully.');
    } catch (error) {
        console.error('Error resetting schema:', error.message);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

function askForConfirmation() {
    return new Promise((resolve) => {
        if (!process.stdin.isTTY) {
            resolve(false);
            return;
        }
        process.stdout.write(
            `\nThis will PERMANENTLY DELETE ALL DATA in database "${process.env.DB_NAME}".\n` +
            'Type the database name to confirm: '
        );
        process.stdin.setEncoding('utf8');
        process.stdin.once('data', (answer) => {
            resolve(answer.trim() === process.env.DB_NAME);
        });
    });
}

async function main() {
    if (require.main !== module) {
        console.error('This script must be run directly: node drop_tables.js');
        return;
    }

    if (process.env.NODE_ENV === 'production') {
        console.error('Refusing to run: NODE_ENV is "production".');
        process.exitCode = 1;
        return;
    }

    if (!process.argv.includes('--force')) {
        console.error('Refusing to run without --force.');
        console.error('Usage: NODE_ENV=development node drop_tables.js --force [--yes]');
        process.exitCode = 1;
        return;
    }

    const confirmed = process.argv.includes('--yes') || await askForConfirmation();
    if (!confirmed) {
        console.error('Aborted: confirmation did not match.');
        process.exitCode = 1;
        return;
    }

    await resetSchema();
}

main();
