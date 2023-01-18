const keys = require('./keys');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  dialect: 'mysql',
  logging: false
  });
  sequelize.authenticate().then(() => {
console.log('Connected to mysql')});
sequelize.sync({ force: true })
  .then(() => {
    console.log(`Database & tables created!`)
  })


  module.exports = sequelize;