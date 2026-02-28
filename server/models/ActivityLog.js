const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const ActivityLog = sequelize.define('ActivityLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true // Can be null for guest users
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    details: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    pageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userAgent: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'activity_logs',
    timestamps: true
});

module.exports = ActivityLog;
