const Sequelize = require('sequelize');
const sequelize = require('../config/dbconfig');
const Student=require('./student');
const Class=require('./class');
const StudentClass = sequelize.define('student_classes', {
  studentIdId: {
    type: Sequelize.INTEGER,
    field: 'student_id',
    references: {
      model: Student,
      key: 'id', 
    }
  },
  classId: {
    type: Sequelize.INTEGER,
    field: 'class_id',
    references: {
      model: Class,
      key: 'id', 
    },allowNull:false,
    validate: {notNull: true}
  },
 
  active:{type:Sequelize.BOOLEAN,defaultValue:true,allowNull:false, validate: {notNull: true}},
  createdBy:{type:Sequelize.INTEGER,  field: 'created_by',allowNull:false,validate: {notNull: true}},
  updatedBy:{type:Sequelize.INTEGER,  field: 'updated_by'},
  activatedBy: {type:Sequelize.INTEGER, field: 'activated_by',allowNull:false,validate: {notNull: true}},
  activationDate: {type:Sequelize.DATE, field: 'activation_date',allowNull:false,defaultValue: Sequelize.NOW,validate: {notNull: true}},
},{defaultScope: {
    where: {
      active: true
    },
   
  },}
);

module.exports = StudentClass;
