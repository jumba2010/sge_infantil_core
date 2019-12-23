const Sequelize = require('sequelize');
const sequelize = require('../config/dbconfig');
const Sucursal=require('./sucursal');
const Frequency = sequelize.define('Frequency', {
  level: {type:Sequelize.INTEGER,allowNull:false, validate: {notNull: true}},
  description: {type:Sequelize.STRING,allowNull:false, validate: {notNull: true}},
  specialHourMonthlyValue: {type:Sequelize.DOUBLE(14,4), allowNull:false,validate: {notNull: true, isDecimal: true }},
  recurigRegistrationValue: {type:Sequelize.DOUBLE(14,4), allowNull:false,validate: {notNull: true, isDecimal: true }},
  registrationValue: {type:Sequelize.DOUBLE(14,4), allowNull:false,validate: {notNull: true, isDecimal: true }},
  monthlyPayment: {type:Sequelize.DOUBLE(14,4), allowNull:false,validate: {notNull: true, isDecimal: true }},
  sucursalId: {
    type: Sequelize.INTEGER,
    field: 'sucursal_id',
    references: {
      model: Sucursal,
      key: 'id', 
    },allowNull:false,
    validate: {notNull: true}
  },
  active:{type:Sequelize.BOOLEAN,defaultValue:true,allowNull:false, validate: {notNull: true}},
  createdBy:{type:Sequelize.INTEGER,  field: 'created_by',allowNull:false,validate: {notNull: true}},
  updatedBy:{type:Sequelize.INTEGER,  field: 'updated_by'},
  activatedBy: {type:Sequelize.INTEGER, field: 'activated_by',allowNull:false,validate: {notNull: true}},
  activationDate: {type:Sequelize.DATE, field: 'activation_date',allowNull:false,defaultValue: Sequelize.NOW,validate: {notNull: true}},
  
},{
  defaultScope: {
    where: {
      active: true
    }
  },
});
module.exports = Frequency;
