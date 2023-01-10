const express = require('express');
const router = express.Router();
const SubjectTest = require('../models/subjectTest');
const Subject = require('../models/subject');
const Test = require('../models/test');

// Get all subjectTests
router.get('/', (req, res) => {
  SubjectTest.findAll({
    include: [{ model: Subject },{ model: Test }],
  })
    .then(subjectTests => {
      res.json(subjectTests);
    })
    .catch(error => {
      res.status(400).json({ error });
    });
});

// Get subjectTest by id
router.get('/:id', (req, res) => {
  SubjectTest.findByPk(req.params.id, {
    include: [{ model: Subject },{ model: Test }],
  })
    .then(subjectTest => {
      res.json(subjectTest);
    })
    .catch(error => {
      res.status(400).json({ error });
    });
});

module.exports = router;