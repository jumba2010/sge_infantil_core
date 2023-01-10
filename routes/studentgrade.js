const express = require('express');
const router = express.Router();
const StudentGrade = require('../models/studentGrade');
const Student = require('../models/student');
const Grade = require('../models/grade');

// Get all studentGrades
router.get('/', (req, res) => {
  StudentGrade.findAll({
    include: [{ model: Student },{ model: Grade }],
  })
    .then(studentGrades => {
      res.json(studentGrades);
    })
    .catch(error => {
      res.status(400).json({ error });
    });
});

// Get studentGrade by id
router.get('/:id', (req, res) => {
  StudentGrade.findByPk(req.params.id, {
    include: [{ model: Student },{ model: Grade }],
  })
    .then(studentGrade => {
      res.json(studentGrade);
    })
    .catch(error => {
      res.status(400).json({ error });
    });
});

router.get('/student/:studentId/grades', (req, res) => {
    StudentGrade.findAll({
      where: { studentId: req.params.studentId },
      include: [{ model: Grade }],
    })
      .then(studentGrades => {
        const grades = studentGrades.map(studentGrade => studentGrade.grade);
        res.json(grades);
      })
      .catch(error => {
        res.status(400).json({ error });
      });
  });
  
// Create studentGrade
router.post('/', (req, res) => {
  StudentGrade.create(req.body)
    .then(studentGrade => {
      res.json(studentGrade);
    })
    .catch(error => {
      res.status(400).json({ error });
    });
});

// Update studentGrade
router.put('/:id', (req, res) => {
  StudentGrade.update(req.body, { where: { id: req.params.id } })
    .then(() => {
      StudentGrade.findByPk(req.params.id, {
        include: [{ model: Student },{ model: Grade }],
      })
        .then(studentGrade => {
          res.json(studentGrade);
        });
    })
    .catch(error => {
      res.status(400).json({ error });
    });


});

module.exports = router;
