const express = require('express');
const router = express.Router();
const Grade = require('../models/grade');

// Get all grades
router.get('/', (req, res) => {
  Grade.findAll()
    .then(grades => {
      res.json(grades);
    })
    .catch(error => {
      res.status(400).json({ error });
    });
});

// Get grade by id
router.get('/:id', (req, res) => {
  Grade.findByPk(req.params.id)
    .then(grade => {
      res.json(grade);
    })
    .catch(error => {
      res.status(400).json({ error });
    });
});

// Get grades by sucursal
router.get('/sucursal/:sucursalId', (req, res) => {
    Grade.findAll({
      where: { sucursalId: req.params.sucursalId },
      include: [{ model: Sucursal }],
    })
      .then(grades => {
        res.json(grades);
      })
      .catch(error => {
        res.status(400).json({ error });
      });
  });
  

// Create grade
router.post('/', (req, res) => {
  Grade.create(req.body)
    .then(grade => {
      res.json(grade);
    })
    .catch(error => {
      res.status(400).json({ error });
    });
});

// Update grade
router.put('/:id', (req, res) => {
  Grade.update(req.body, { where: { id: req.params.id } })
    .then(() => {
      Grade.findByPk(req.params.id)
        .then(grade => {
          res.json(grade);
        });
    })
    .catch(error => {
      res.status(400).json({ error });
    });
});

// Delete grade
router.delete('/:id', (req, res) => {
  Grade.destroy({ where: { id: req.params.id } })
    .then(() => {
      res.json({ success: true });
    })
    .catch(error => {
      res.status(400).json({ error });
    });
});

module.exports = router;
