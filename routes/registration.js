const express = require('express');
const Registration = require('../models/registration');
const Payment = require('../models/payment');
const Configuration = require('../models/paymentconfig');
var moment = require('moment');
const Student = require('../models/student');
const Carier = require('../models/carier');
const router = express.Router();

//Cria Inscricao
router.post('/', async (req, res) => {
  const { totalPaid, monthlyPayment, discount, isNew, needSpecialTime, studentId, sucursal, classId, createdBy, activatedBy } = req.body;
  let year = new Date().getFullYear();
  Registration.create({ year, totalPaid, monthlyPayment, discount, isNew, needSpecialTime, studentId, sucursalId: sucursal.id, classId, createdBy, activatedBy }
  ).then(async function (registration) {

    var initialMont = sucursal.code === '001' ? 2 : 1;
    let today = new Date();
    if ((sucursal.code === '001' && today.getMonth() > 2)
      || (sucursal.code === '002' && today.getMonth() > 1)) {
      initialMont = today.getMonth() + 1;
    }



    //Verifica se esta  iscrição está sendo feita após a data de inicio das aulas
    let configuration = await Configuration.findOne({
      where: { sucursalId: sucursal.id }
    });

    for (i = initialMont; i <= 11; i++) {

      let limitDate = moment([year, (i - 1), configuration.paymentEndDay + 1])
        ;
      Payment.create({ month: i, year, total: monthlyPayment, limitDate: limitDate.utc().format("YYYY-MM-DD"), discount, registrationId: registration.id, studentId, sucursalId: sucursal.id, createdBy, activatedBy }
      )
    }
    res.send(registration);
  })
});

//Renova a inscricao
router.post('/renew', async (req, res) => {
  const { year, totalPaid, monthlyPayment, discount, needSpecialTime, studentId, sucursal, classId, createdBy, activatedBy } = req.body;
  Registration.create({ year, totalPaid, monthlyPayment, discount, isNew: false, needSpecialTime, studentId, sucursalId: sucursal.id, classId, createdBy, activatedBy }
  ).then(async function (registration) {
    var initialMont = 3;
    for (i = initialMont; i <= 11; i++) {
      let limitDate = moment([year, (i - 1), configuration.paymentEndDay + 1])
      Payment.create({ month: i, year, total: monthlyPayment, limitDate: limitDate.utc().format("YYYY-MM-DD"), discount, registrationId: registration.id, studentId, sucursalId: sucursal.id, createdBy, activatedBy })
    }
    res.send(registration);
  })
});

router.put('/:id', async (req, res) => {
  const { totalPaid, discount, newStudennt, studentId, sucursalId, classId, updatedBy } = req.body;
  Registration.update(
    { totalPaid, discount, newStudennt, studentId, sucursalId, classId, updatedBy },
    { fields: ['totalPaid', 'newStudennt', 'studentId', 'sucursalId', 'discount', 'classId', 'updatedBy'] },
    { where: { id: req.params.id } }
  )
    .then(result =>
      res.send(result)
    )
    .catch(err =>
      console.log(err)
    )
});


router.put('/inativate/:id', async (req, res) => {
  Registration.update(
    { active: false, activationDate: Date.now(), activatedBy },
    { fields: ['active', 'activationDate', 'activatedBy'] },
    { where: { id: req.params.id } }
  )
    .then(result =>
      res.send(result)
    )
    .catch(err =>
      console.log(err)
    )
});


router.get('/:page', async (req, res) => {
  var page = req.params.page;
  Registration.findAll({ offset: (6 * page) - 6, limit: 6, order: 'createdAt DESC' }).then(function (registrations) {
    res.send(registrations);
  });
});

router.get('/', async (req, res) => {
  Registration.findAll({ order: 'createdAt DESC' }).then(function (registrations) {
    res.send(registrations);
  });
});

router.get('/studentId/:studentId', async (req, res) => {
  Registration.findAll({ where: { studentId: req.params.studentId }, order: 'createdAt DESC' }).then(function (registrations) {
    res.send(registrations[0]);
  });
});

router.get('/count/all/registrations', async (req, res) => {
  Registration.count()
    .then(function (total) {
      res.status(200).json({
        total: total
      });
    });
});

router.get('/betwen/:startdate/:endDate/:page', async (req, res) => {
  var page = req.params.page;
  Registration.findAll({
    where: {
      createdAt: {
        $between: [req.params.startdate, req.params.enddate],
      }
    },

    offset: (6 * page) - 6, limit: 6, order: 'createdAt DESC'
  }).then(function (registrations) {
    res.send(registrations);
  });
});

router.get('/count/betwen/:startdate/:endDate', async (req, res) => {
  Registration.count({
    where: {
      createdAt: {
        $between: [req.params.startdate, req.params.enddate],
      }
    }
  })
    .then(function (total) {
      res.status(200).json({
        total: total
      });
    });
});


router.get('/sucursal/:sucursalId', async (req, res) => {
  Registration.findAll({ where: { sucursalId: req.params.sucursalId }, order: 'createdAt DESC' }).then(function (registrations) {
    res.send(registrations);
  });
});

router.get('/sucursal/:sucursalId/count/all/registrations', async (req, res) => {
  Registration.count({ where: { sucursalId: req.params.sucursalId } })
    .then(function (total) {
      res.status(200).json({
        total: total
      });
    });
});

router.get('/current/:sucursalId', async (req, res) => {
  let newList = []
  let year = new Date().getFullYear()
  Registration.findAll({
    raw: true, where: { sucursalId: req.params.sucursalId, year }, order: [
      ['createdAt', 'DESC'],
    ]
  }).then(function (registrations) {
    registrations.forEach(registration => {
      Student.findOne({
        raw: true, where: { id: registration.studentId }
      }).then(function (student) {
        Payment.findAll({
          raw: true, where: { registrationId: registration.id }, order: [
            ['month', 'ASC'],
          ]
        }).then(function (payments) {
          Carier.findOne({ raw: true, where: { studentId: student.id } })
            .then(function (carier) {
              student.payments = payments
              student.registration = registration
              student.carier = carier
              newList.push(student)
              if (newList.length == registrations.length) {
                res.send(newList);
              }
            })
        })
      });

    });
  });

});


router.get('count/:sucursalId', async (req, res) => {
  Registration.count({ where: { sucursalId: req.params.sucursalId } })
    .then(function (total) {
      res.status(200).json({
        total: total
      });
    });
});





module.exports = router;