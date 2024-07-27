require('dotenv').config();
const Sequelize = require('sequelize');
const sequelize = new Sequelize('sge', 'root', 'mysql', {
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