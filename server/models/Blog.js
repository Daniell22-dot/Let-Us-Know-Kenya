const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Blog = sequelize.define('Blog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING
    },
    author: {
        type: DataTypes.STRING
    },
    authorRole: {
        type: DataTypes.STRING
    },
    content: {
        type: DataTypes.TEXT
    },
    excerpt: {
        type: DataTypes.TEXT
    },
    date: {
        type: DataTypes.STRING
    },
    readTime: {
        type: DataTypes.STRING
    },
    image: {
        type: DataTypes.STRING
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING)
    },
    status: {
        type: DataTypes.ENUM('published', 'draft', 'pending'),
        defaultValue: 'published'
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    comments: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    upvotes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    downvotes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

module.exports = Blog;
