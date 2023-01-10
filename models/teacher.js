const Sequelize = require('sequelize');

const sequelize = require('../config/dbconfig');
const Sucursal=require('./sucursal');
const Teacher = sequelize.define('teacher', {
  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
});
Sucursal.hasMany(Teacher);
Teacher.belongsTo(Sucursal);
module.exports = Teacher;
