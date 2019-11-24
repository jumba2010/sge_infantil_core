const Sequelize = require('sequelize');
const sequelize = require('../config/dbconfig');
const Registration = require('./registration');
const Payment = sequelize.define('Payment', {
  month: {type:Sequelize.INTEGER,allowNull:false,validate: {notNull: true}},
  year: {type:Sequelize.INTEGER,allowNull:false,validate: {notNull: true}},
  total: {type:Sequelize.DOUBLE(14,4),allowNull:false,validate: {notNull: true}},
  fine: {type:Sequelize.DOUBLE(14,4),allowNull:false,validate: {notNull: true}},
  discount: {type:Sequelize.DOUBLE(5,4),allowNull:false,validate: {notNull: true}},
  status: {type:Sequelize.STRING,allowNull:false,validate: {notNull: true}},
  registrationId: {
    type: Sequelize.INTEGER,
    field: 'registration_id',
    references: {
      model: Registration,
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
      { model: Registration, where: { active: true }}
    ]
  },
});

module.exports = Payment;
