const Sequelize = require('sequelize');
const Subject = require('./subject');
const sequelize = require('../config/dbconfig');

const Test = sequelize.define('test', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  }
});

Test.belongsTo(Subject);

module.exports = Test;
