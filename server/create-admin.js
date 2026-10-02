/**
 * Creates (or promotes) the admin account used by the /admin panel.
 *
 * Usage:
 *   npm run create-admin
 *
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from server/.env. Run it once after the
 * first deployment; re-running it resets the password to match the .env value.
 *
 * The password is hashed by the User.beforeCreate / beforeUpdate hooks, so the
 * plaintext is never written to the database.
 */
require('dotenv').config();

const db = require('./models');
const User = db.models.User;

async function main() {
    const email = (process.env.ADMIN_EMAIL || '').trim();
    const password = process.env.ADMIN_PASSWORD || '';

    if (!email || !password) {
        console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env first.');
        process.exitCode = 1;
        return;
    }

    if (password.length < 8) {
        console.error('ADMIN_PASSWORD must be at least 8 characters long.');
        process.exitCode = 1;
        return;
    }

    console.log(`Connecting to database "${process.env.DB_NAME}"...`);
    await db.sequelize.authenticate();

    // Make sure the schema exists before writing to it.
    await db.sequelize.sync();

    const existing = await User.findOne({ where: { email } });

    if (existing) {
        await User.update(
            { password, role: 'admin', name: existing.name || 'Administrator' },
            { where: { id: existing.id } }
        );
        console.log(`Promoted existing user ${email} to admin and reset their password.`);
    } else {
        await User.create({
            username: email.split('@')[0],
            name: 'Administrator',
            email,
            password,
            role: 'admin'
        });
        console.log(`Created admin account ${email}.`);
    }

    await db.sequelize.close();
}

main().catch(async (err) => {
    console.error('Failed to create admin account:', err.message);
    try {
        await db.sequelize.close();
    } catch (_) {
        /* ignore */
    }
    process.exitCode = 1;
});
