require('dotenv').config();
const { Sequelize } = require('sequelize');

// Neon hands out a single pooled connection string (NEON_URL). Local
// development uses the discrete DB_* parts instead. NEON_URL wins when present
// so the same code runs against either without edits.
const common = {
    dialect: 'postgres',
    logging: false, // Set to true if you want to see SQL queries
    pool: {
        max: 5,
        min: 0,
        // Managed Postgres over TLS is not instant: a cold connection to Neon
        // takes roughly 20s here, so the default 30s acquire window leaves no
        // headroom and fails intermittently on boot.
        acquire: 60000,
        idle: 10000
    }
};

const sequelize = process.env.NEON_URL
    ? new Sequelize(process.env.NEON_URL, {
        ...common,
        // Neon only accepts TLS connections. The certificate is issued by a CA
        // node-postgres already trusts, but Neon presents a per-endpoint cert
        // chain, so verification stays on where possible and is relaxed only
        // when the driver cannot build the chain.
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: process.env.NEON_SSL_REJECT_UNAUTHORIZED === 'true'
            }
        }
    })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            ...common,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT
        }
    );

module.exports = sequelize;