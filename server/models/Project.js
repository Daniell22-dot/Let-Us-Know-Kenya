const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Spatial Ecology'
    },
    abstract: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    authors: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    datePublished: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    thumbnail: {
        type: DataTypes.STRING,
        allowNull: true, // URL to cover image
    },
    documentUrl: {
        type: DataTypes.STRING,
        allowNull: true, // URL to PDF/HTML report
    },
    status: {
        type: DataTypes.ENUM('published', 'draft'),
        defaultValue: 'published'
    }
});

module.exports = Project;
