const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    entityType: {
        type: DataTypes.ENUM('blog', 'podcast'),
        allowNull: false
    },
    entityId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        defaultValue: 'Anonymous'
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 }
    },
    comment: {
        type: DataTypes.TEXT
    }
});

module.exports = Review;
