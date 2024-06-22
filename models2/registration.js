const Sequelize = require('sequelize');
const sequelize = require('../config/dbconfig');
const Student=require('./student');
const Sucursal=require('./sucursal');
const Frequency=require('./frequency');
const Class=require('./class');
const Registration = sequelize.define('registration', {
  monthlyPayment: {type:Sequelize.DOUBLE(14,4),allowNull:false, validate: {notNull: true}},
  totalPaid: {type:Sequelize.DOUBLE(14,4),allowNull:false, validate: {notNull: true}},
  discount: {type:Sequelize.DOUBLE(4,2),allowNull:false,defaultValue:0.00, validate: {notNull: true}},
  isNew:{type:Sequelize.BOOLEAN,allowNull:false,defaultValue:true, validate: {notNull: true}},  
  needSpecialTime:{type:Sequelize.BOOLEAN,allowNull:false,defaultValue:false, validate: {notNull: true}},
  year: {type:Sequelize.INTEGER(4,2),allowNull:false, validate: {notNull: true}},
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
  syncStatus: {type:Sequelize.INTEGER,allowNull:false,validate: {notNull: true},defaultValue:0},
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

// Student.hasMany(Registration);
// Registration.belongsTo(Student);

// Class.hasMany(Registration);
// Registration.belongsTo(Class);

// Frequency.hasMany(Registration);
// Registration.belongsTo(Frequency);
module.exports = Registration;
