const Sequelize = require('sequelize');
const sequelize = require('../config/dbconfig');
const DeliveryReport = sequelize.define('DeliveryReport', {
  requestId: {type:Sequelize.STRING,allowNull:false, validate: {notNull: true}},
  senderId: {type:Sequelize.STRING,allowNull:false, validate: {notNull: true}},
  status: {type:Sequelize.STRING,allowNull:false, validate: {notNull: true}},
  number: {type:Sequelize.STRING,allowNull:false, validate: {notNull: true}},
  date: {type:Sequelize.STRING,allowNull:false, validate: {notNull: true}},
  syncStatus: {type:Sequelize.INTEGER,allowNull:false,validate: {notNull: true},defaultValue:0},
});

module.exports = DeliveryReport;
