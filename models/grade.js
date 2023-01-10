const Sequelize = require('sequelize');
const sequelize = require('../config/dbconfig');
const Sucursal = require('./sucursal');
const Grade = sequelize.define('grade', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  }
});

Grade.belongsTo(Sucursal);
module.exports = Grade;
