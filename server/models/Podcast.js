const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Podcast = sequelize.define('Podcast', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    host: {
        type: DataTypes.STRING,
        allowNull: false
    },
    length: {
        type: DataTypes.STRING
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING)
    },
    description: {
        type: DataTypes.TEXT
    },
    audioUrl: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM('published', 'draft', 'pending'),
        defaultValue: 'draft'
    },
    date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    plays: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    thumbnail: {
        type: DataTypes.STRING
    },
    featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    category: {
        type: DataTypes.STRING
    }
});

module.exports = Podcast;
