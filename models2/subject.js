const Sequelize = require('sequelize');
const sequelize = require('../config/dbconfig');
const Sucursal = require('./sucursal');
const Subject = sequelize.define('subject', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  }
});

Subject.belongsTo(Sucursal);
module.exports = Subject;
