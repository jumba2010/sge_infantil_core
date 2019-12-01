const Sequelize = require('sequelize');
const sequelize = require('../config/dbconfig');
const Sucursal=require('./sucursal');
const Student = sequelize.define('Student', {
  name: {type:Sequelize.STRING,allowNull:false, validate: {notNull: true,notEmpty: true}},
  address: {type:Sequelize.STRING,allowNull:false, validate: {notNull: true}},
  sex: {type:Sequelize.ENUM('M', 'F'),allowNull:false, validate: {notNull: true}},
  picture:Sequelize.STRING,
  birthDate:{type:Sequelize.DATEONLY, allowNull:false,validate: {notNull: true}},
  docType:{type:Sequelize.STRING, allowNull:false,validate: {notNull: true}},
  docNumber:{type:Sequelize.STRING, allowNull:false,validate: {notNull: true}},
  studentNumber: {type:Sequelize.STRING}, 
  motherName:{type:Sequelize.STRING, allowNull:false,validate: {notNull: true}},
  motherContact:Sequelize.STRING,
  fatherContact:Sequelize.STRING,
  fatherName:{type:Sequelize.STRING, allowNull:false,validate: {notNull: true}}, 
  currentMonthlyPayment: {type:Sequelize.DOUBLE(14,4),allowNull:false, validate: {notNull: true}},
  level: {type:Sequelize.INTEGER,allowNull:false, validate: {notNull: true}},
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
},
{
  defaultScope: {
    where: {
      active: true
    }
  },
}
);

module.exports = Student;
