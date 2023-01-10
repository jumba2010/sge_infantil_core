const express = require('express');
const router = express.Router();
const Subject = require('../models/subject');

// Get all subjects
router.get('/', (req, res) => {
  Subject.findAll()
    .then(subjects => {
      res.json(subjects);
    })
    .catch(error => {
      res.status(400).json({ error });
    });
});


// Get subject by id
router.get('/:id', (req, res) => {
  Subject.findByPk(req.params.id)
    .then(subject => {
      res.json(subject);
    })
    .catch(error => {
      res.status(400).json({ error });
    });
});

// Get subjects by sucursal
router.get('/sucursal/:sucursalId', (req, res) => {
    Subject.findAll({
      where: { sucursalId: req.params.sucursalId },
      include: [{ model: Sucursal }],
    })
      .then(subjects => {
        res.json(subjects);
      })
      .catch(error => {
        res.status(400).json({ error });
      });
  });
  

// Create subject
router.post('/', (req, res) => {
    Subject.create(req.body)
      .then(subject => {
        res.json(subject);
      })
      .catch(error => {
        res.status(400).json({ error });
      });
  });

module.exports = router;