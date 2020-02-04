const Sequelize = require('sequelize');
const sequelize = require('../config/dbconfig');
const Profile=require('./profile');
const User = sequelize.define('user', {
  name: {type:Sequelize.STRING,allowNull:false, validate: {notNull: true,notEmpty: true}},
  email: {type:Sequelize.STRING, },
  contact: {type:Sequelize.STRING,allowNull:false, validate: {notNull: true}},
  address: {type:Sequelize.STRING,allowNull:false, validate: {notNull: true}},
  picture:Sequelize.STRING,
  username: {type:Sequelize.STRING, allowNull:false,validate: {notNull: true,notEmpty: true}},
  password: {type:Sequelize.STRING,allowNull:false, validate: {notNull: true,max:8,min:6,notEmpty: true}},
  profileId: {
    type: Sequelize.INTEGER,
    field: 'profile_id',
    references: {
      model: Profile,
      key: 'id', 
    }
  },
  syncStatus: {type:Sequelize.INTEGER,allowNull:false,validate: {notNull: true},defaultValue:0},
  active:{type:Sequelize.BOOLEAN,defaultValue:true,allowNull:false, validate: {notNull: true}},
  createdBy:{type:Sequelize.INTEGER,  field: 'created_by',allowNull:false,validate: {notNull: true}},
  updatedBy:{type:Sequelize.INTEGER,  field: 'updated_by'},
  activatedBy: {type:Sequelize.INTEGER, field: 'activated_by',allowNull:false,validate: {notNull: true}},
  activationDate: {type:Sequelize.DATE, field: 'activation_date',allowNull:false,defaultValue: Sequelize.NOW,validate: {notNull: true}},
}
);

module.exports = User;
