const keys = require('./keys');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(keys.msqlDbName, keys.msqlUsername, keys.mysqlpassword, {
  dialect: 'mariadb',
  logging: false
  });
  sequelize.authenticate().then(() => {
console.log('Connected to mysql')});
sequelize.sync({ force: true })
  .then(() => {
    console.log(`Database & tables created!`)
  })


  module.exports = sequelize;