const keys = require('./keys');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(keys.msqlDbName, keys.msqlUsername, keys.mysqlpassword, {
  dialect: 'mysql',
  logging: false
  });
  sequelize.authenticate().then(() => {
console.log('Connected to mysql')});
sequelize.sync({ force: false })
  .then(() => {
    console.log(`Database & tables created!`)
  })


  module.exports = sequelize;