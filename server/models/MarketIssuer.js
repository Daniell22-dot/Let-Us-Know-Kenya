const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const MarketIssuer = sequelize.define('MarketIssuer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ticker: {
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING
    },
    sector: {
        type: DataTypes.STRING,
        defaultValue: 'Other'
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = MarketIssuer;