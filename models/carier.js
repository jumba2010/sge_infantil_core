const Sequelize = require('sequelize');
const sequelize = require('../config/dbconfig');
const Student=require('./student');
const Carier = sequelize.define('Carier', {
  name: {type:Sequelize.STRING,allowNull:false, validate: {notNull: true}},
  kinshipDegree: {type:Sequelize.STRING,allowNull:false, validate: {notNull: true}},
  principal: {type:Sequelize.BOOLEAN,allowNull:false, validate: {notNull: true}},
  contact: {type:Sequelize.STRING,allowNull:false, validate: {notNull: true}},
  docType: {type:Sequelize.STRING},
  docNumber: {type:Sequelize.STRING},
  workPlace: {type:Sequelize.STRING},
  studentId: {
    type: Sequelize.INTEGER,
    field: 'student_id',
    references: {
      model: Student,
      key: 'id', 
    }
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

module.exports = Carier;
