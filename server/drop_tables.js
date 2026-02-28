const sequelize = require('./config/db.config');

async function fixSchema() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();

        console.log('Dropping and recreating public schema...');
        await sequelize.query('DROP SCHEMA public CASCADE;');
        await sequelize.query('CREATE SCHEMA public;');
        await sequelize.query('GRANT ALL ON SCHEMA public TO public;');

        console.log('Schema reset successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing schema:', error);
        process.exit(1);
    }
}

fixSchema();
