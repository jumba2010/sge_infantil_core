const Sequelize = require('sequelize');
const Student = require('./student');
const Grade = require('./grade');
const sequelize = require('../config/dbconfig');

const StudentGrade = sequelize.define('student_grade', {
  grade_value: {
    type: Sequelize.INTEGER,
    allowNull: false,
  }
});

StudentGrade.belongsTo(Student);
StudentGrade.belongsTo(Grade);

module.exports = StudentGrade;
