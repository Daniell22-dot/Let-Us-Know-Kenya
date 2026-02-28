const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Job = sequelize.define('Job', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    company: {
        type: DataTypes.STRING
    },
    location: {
        type: DataTypes.STRING
    },
    type: {
        type: DataTypes.STRING
    },
    salary: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('published', 'draft', 'pending'),
        defaultValue: 'published'
    },
    posted: {
        type: DataTypes.STRING
    },
    applicants: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    category: {
        type: DataTypes.STRING
    }
});

module.exports = Job;
