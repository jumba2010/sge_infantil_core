const Sequelize = require('sequelize');
const sequelize = require('../config/dbconfig');
const Subject = require('./subject');
const Test = require('./test');

const SubjectTest = sequelize.define('subject_test', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  quarter: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  percentage: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
});

SubjectTest.belongsTo(Subject);
SubjectTest.belongsTo(Test);

module.exports = SubjectTest;
