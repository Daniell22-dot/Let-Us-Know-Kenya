const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const WatchlistItem = sequelize.define('WatchlistItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    entityType: {
        type: DataTypes.ENUM('blog', 'podcast', 'project'),
        allowNull: false
    },
    entityId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = WatchlistItem;
