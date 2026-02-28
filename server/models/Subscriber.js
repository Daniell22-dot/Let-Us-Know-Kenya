const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Subscriber = sequelize.define("subscriber", {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = Subscriber;
