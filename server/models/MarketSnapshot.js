const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

/**
 * One row per issuer per trading day. NSE's public ticker feed exposes only a
 * live snapshot, so history is built by syncing on a schedule; each sync
 * overwrites the row for that trading day and the row converges to the
 * official close. The trading date is stored as a plain YYYY-MM-DD string so
 * the bucket never shifts across time zones.
 */
const MarketSnapshot = sequelize.define('MarketSnapshot', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ticker: {
        type: DataTypes.STRING(16),
        allowNull: false
    },
    tradingDate: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    open: {
        type: DataTypes.DECIMAL(12, 2)
    },
    high: {
        type: DataTypes.DECIMAL(12, 2)
    },
    low: {
        type: DataTypes.DECIMAL(12, 2)
    },
    close: {
        type: DataTypes.DECIMAL(12, 2)
    },
    prevClose: {
        type: DataTypes.DECIMAL(12, 2)
    },
    volume: {
        type: DataTypes.BIGINT
    },
    turnover: {
        type: DataTypes.DECIMAL(18, 2)
    },
    changePct: {
        type: DataTypes.DECIMAL(8, 2)
    },
    capturedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    indexes: [
        { unique: true, fields: ['ticker', 'tradingDate'] },
        { fields: ['tradingDate'] }
    ]
});

module.exports = MarketSnapshot;