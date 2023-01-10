const Sequelize = require('sequelize');
const sequelize = require('../config/dbconfig');
const Teacher = require('./teacher');

const Class = sequelize.define('class', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  subject: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

Teacher.hasMany(Class);
Class.belongsTo(Teacher);

module.exports = Class;
