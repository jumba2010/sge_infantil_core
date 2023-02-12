require('dotenv').config();
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, 'root', 'mysql', {
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