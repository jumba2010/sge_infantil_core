const Sequelize = require('sequelize');
const sequelize = require('../config/dbconfig');
const Student=require('./student');
const Sucursal=require('./sucursal');
const Class=require('./frequency');
const Registration = sequelize.define('Registration', {
  monthlyPayment: {type:Sequelize.DOUBLE(14,4),allowNull:false, validate: {notNull: true}},
  totalPaid: {type:Sequelize.DOUBLE(14,4),allowNull:false, validate: {notNull: true}},
  discount: {type:Sequelize.DOUBLE(4,2),allowNull:false,defaultValue:0.00, validate: {notNull: true}},
  newStudennt:{type:Sequelize.BOOLEAN,allowNull:false,defaultValue:true, validate: {notNull: true}},
  studentId: {
    type: Sequelize.INTEGER,
    field: 'student_id',
    references: {
      model: Student,
      key: 'id', 
    },allowNull:false,
    validate: {notNull: true}
  },
  sucursalId: {
    type: Sequelize.INTEGER,
    field: 'sucursal_id',
    references: {
      model: Sucursal,
      key: 'id', 
    },allowNull:false,
    validate: {notNull: true}
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
  
},{
  defaultScope: {
    where: {
      active: true
    }
    ,
    include: [
      { model: Student, where: { active: true }}
    ]
  },
});

module.exports = Registration;
