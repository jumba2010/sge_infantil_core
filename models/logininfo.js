const Sequelize = require('sequelize');
const sequelize = require('../config/dbconfig');
const User = require('./user');
const LoginInfo = sequelize.define('LoginInfo', {
  ipaddress: {type:Sequelize.STRING,allowNull:false,validate: {notNull: true}},
  macaddress: {type:Sequelize.STRING},
  location: {type:Sequelize.STRING},
  duration: {type:Sequelize.INTEGER},
  device:{type:Sequelize.INTEGER},
  userId: {
    type: Sequelize.INTEGER,
    field: 'user_id',
    references: {
      model: User,
      key: 'id', 
    },allowNull:false,
    validate: {notNull: true}
  }, 

  loginDate: {type:Sequelize.DATE, field: 'login_date',allowNull:false,defaultValue: Sequelize.NOW,validate: {notNull: true}},
     
},);

module.exports = LoginInfo;
