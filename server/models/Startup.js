const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Startup = sequelize.define('Startup', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    founder: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.TEXT
    },
    sector: {
        type: DataTypes.STRING
    },
    stage: {
        type: DataTypes.STRING
    },
    location: {
        type: DataTypes.STRING
    },
    status: {
        // 'approved' and 'rejected' were missing, so the moderation endpoints
        // (PUT /startups/:id/approve|reject) always failed with a Postgres
        // enum validation error while the admin UI optimistically displayed
        // success. The full vocabulary now matches the admin panel.
        type: DataTypes.ENUM('published', 'draft', 'pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    logo: {
        type: DataTypes.STRING
    },
    funding: {
        type: DataTypes.STRING
    },
    employees: {
        type: DataTypes.INTEGER
    },
    founded: {
        type: DataTypes.INTEGER
    },
    website: {
        type: DataTypes.STRING
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING)
    }
});

module.exports = Startup;
