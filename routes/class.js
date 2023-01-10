const express = require('express');
const router = express.Router();
const Class = require('../models/class');
const Teacher = require('../models/teacher');
const Sucursal = require('../models/sucursal');

// Get all classes
router.get('/', (req, res) => {
  Class.findAll()
    .then(classes => {
      res.json(classes);
    })
    .catch(error => {
      res.status(400).json({ error });
    });
});

// Get classes by sucursal
router.get('/sucursal/:sucursalId', (req, res) => {
    Class.findAll({ where: { sucursalId: req.params.sucursalId }, include: [{ model: Teacher }] })
      .then(classes => {
        res.json(classes);
      })
      .catch(error => {
        res.status(400).json({ error });
      });
  });

  // Get teachers by sucursal
  router.get('/teachers/sucursal/:sucursalId', (req, res) => {
    Teacher.findAll({ where: { sucursalId: req.params.sucursalId } })
      .then(teachers => {
        res.json(teachers);
      })
      .catch(error => {
        res.status(400).json({ error });
      });
  });


  // Get classes by teacher and sucursal
router.get('/teacher/:teacherId/sucursal/:sucursalId', (req, res) => {
    Class.findAll({
      where: {
        teacherId: req.params.teacherId,
        sucursalId: req.params.sucursalId
      },
      include: [{ model: Teacher }, { model: Sucursal }],
    })
      .then(classes => {
        res.json(classes);
      })
      .catch(error => {
        res.status(400).json({ error });
      });
  });
  
  // Assign teacher to a class
  router.put('/:id/teacher', (req, res) => {
    Class.findByPk(req.params.id)
      .then(theClass => {
        theClass.setTeacher(req.body.teacherId)
          .then(() => {
            res.json({ success: true });
          })
          .catch(error => {
            res.status(400).json({ error });
          });
      })
      .catch(error => {
        res.status(400).json({ error });
      });
  });
  
// Assign teacher to a class
router.put('/:id/teacher', (req, res) => {
    Class.findByPk(req.params.id)
      .then(theClass => {
        theClass.setTeacher(req.body.teacherId)
          .then(() => {
            res.json({ success: true });
          })
          .catch(error => {
            res.status(400).json({ error });
          });
      })
      .catch(error => {
        res.status(400).json({ error });
      });
  });
  
  

// Create a new class
router.post('/', (req, res) => {
  Class.create(req.body)
    .then(classJson => {
      res.json(classJson);
    })
    .catch(error => {
      res.status(400).json({ error });
    });
});

// Update an existing class
router.put('/:id', (req, res) => {
  Class.update(req.body, { where: { id: req.params.id } })
    .then(classJson => {
      res.json(classJson);
    })
    .catch(error => {
      res.status(400).json({ error });
    });
});

// Delete a class
router.delete('/:id', (req, res) => {
  Class.destroy({ where: { id: req.params.id } })
    .then(() => {
      res.json({ success: true });
    });
});


module.exports = router;

