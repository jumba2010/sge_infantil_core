const express = require('express');
const router = express.Router();
const Teacher = require('../models/teacher');

// Get all teachers
router.get('/', (req, res) => {
  Teacher.findAll()
    .then(teachers => {
      res.json(teachers);
    })
    .catch(error => {
      res.status(400).json({ error });
    });
});

// Create a new teacher
router.post('/', (req, res) => {
  Teacher.create(req.body)
    .then(teacher => {
      res.json(teacher);
    })
    .catch(error => {
      res.status(400).json({ error });
    });
});

// Update an existing teacher
router.put('/:id', (req, res) => {
  Teacher.update(req.body, { where: { id: req.params.id } })
    .then(teacher => {
      res.json(teacher);
    })
    .catch(error => {
      res.status(400).json({ error });
    });
});

// Delete a teacher
router.delete('/:id', (req, res) => {
  Teacher.destroy({ where: { id: req.params.id } })
    .then(() => {
      res.json({ success: true });
    })
    .catch(error => {
      res.status(400).json({ error });
    });
});

module.exports = router;
