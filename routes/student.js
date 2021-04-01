const express = require('express');
const Student = require('../models/student');
const Payment = require('../models/payment');
const Registration = require('../models/registration');
const Carier = require('../models/carier');
const sequelize = require('sequelize');
const router = express.Router();

router.post('/', async (req, res) => {
  const { name, sex, alergicToFood, alergicToMedicine, wasTransfered, oldSchool, studentAddress, birthDate, docType, docNumber, motherContact, fatherContact, motherName, fatherName, picture, currentMonthlyPayment, level, sucursalId, sucursal, createdBy, activatedBy } = req.body;
  Student.findAll({
    attributes: [[sequelize.fn('max', sequelize.col('id')), 'id']],
    raw: true,
  }).then(function (maxId) {
    var id = maxId[0].id + 1 + ""
    let sequenceNumber = id.padStart(5, '0');
    let studentNumber = new Date().getFullYear() + sucursal.code + sequenceNumber;
    Student.create({ name, address: studentAddress, alergicToFood, wasTransfered, oldSchool, alergicToMedicine, sex, birthDate, docType, docNumber, motherContact, fatherContact, motherName, fatherName, picture, currentMonthlyPayment, level, studentNumber, sucursalId, createdBy, activatedBy }).then(function (student) {
      res.send(student);
    })

  });


});

router.put('/:id', async (req, res) => {
  const { name, alergicToFood, alergicToMedicine,
    carierId,
    registrationId, oldSchool, address, sex,
    birthDate, docType, docNumber, studentNumber,
    motherName, fatherName, picture,
    motherContact, fatherContact,
    totalPaid, monthlyPayment, payments,
    carierName, kinshipDegree, contact, carierDocType, carierDocNumber, workPlace,
    discount, isNew, needSpecialTime, classId,
    currentMonthlyPayment, level, updatedBy } = req.body;

  await Student.update(
    { name, alergicToFood, fatherContact, motherContact, alergicToMedicine, syncStatus: 1, oldSchool, address, sex, birthDate, docType, docNumber, studentNumber, motherName, currentMonthlyPayment, level, fatherName, picture, updatedBy },
    { where: { id: req.params.id } },
    { fields: ['alergicToMedicine', 'oldSchool', 'syncStatus', 'alergicToFood', 'sex', 'name', 'address', 'birthDate', 'docType', 'docNumber', 'currentMonthlyPayment', 'level', 'studentNumber', 'motherName', 'fatherName', 'updatedBy', 'picture'] },

  );

  //Actualizada Dados do Encarregado
  await Carier.update(
    { name: carierName, kinshipDegree, syncStatus: 1, contact, docType: carierDocType, docNumber: carierDocNumber, workPlace, updatedBy },
    { where: { id: carierId } },
    { fields: ['name', 'kinshipDegree', 'syncStatus', 'contact', 'docType', 'docNumber', 'workPlace', 'updatedBy'] },
  );

  //Actualiza Dados da Inscrição
  await Registration.update(
    { totalPaid, monthlyPayment, syncStatus: 1, discount, isNew, needSpecialTime, classId, updatedBy },
    { where: { id: registrationId } },
    { fields: ['totalPaid', 'monthlyPayment', 'isNew', 'needSpecialTime', 'discount', 'classId', 'updatedBy'] });

  //Actualiza os Pagamentos
  for (let i = 0; i < payments.length; i++) {
    if (payments[i].status === 0) {
      await Payment.update(
        { total: monthlyPayment, discount, syncStatus: 1, updatedBy },
        { where: { id: payments[i].id } },
        { fields: ['total', 'discount', 'updatedBy'] },
      );
    }
  }
});

router.put('/inativate/:id', async (req, res) => {
  const { payments, registrationId, carierId, activatedBy } = req.body;

  //Inativa o Estudante
  await Student.update(
    { active: false, activationDate: Date.now(), syncStatus: 1, activatedBy },
    { where: { id: req.params.id } },
    { fields: ['active', 'syncStatus', 'activationDate', 'activatedBy'] },

  );

  //Inativa a inscrição
  await Registration.update(
    { active: false, activationDate: Date.now(), activatedBy },
    { where: { id: registrationId } },
    { fields: ['active', 'activationDate', 'activatedBy'] },
  );

  //Inativa o encarregado
  await Carier.update(
    { active: false, activationDate: Date.now(), activatedBy },
    { where: { id: carierId } },
    { fields: ['active', 'activationDate', 'activatedBy'] },
  );

  //Inativa os Pagaments
  for (let i = 0; i < payments.length; i++) {
    Payment.update(
      { active: false, activationDate: Date.now(), activatedBy },
      { where: { id: payments[i].id } },
      { fields: ['active', 'activationDate', 'activatedBy'] },

    );
  }
});

router.get('/:page', async (req, res) => {
  var page = req.params.page;
  Student.findAll({ offset: (6 * page) - 6, limit: 6, order: 'createdAt DESC' }).then(function (students) {
    res.send(students);
  });
});


router.get('/unique/:id', async (req, res) => {
  Student.findOne({
    raw: true, where: { id: req.params.id }
  }).then(async function (student) {
    const element = student;
    let registrations = await Registration.findAll({
      raw: true, where: { studentId: element.id }, order: [
        ['createdAt', 'DESC'],
      ],
    });

    let payments = await Payment.findAll({
      raw: true, where: { studentId: element.id }, order: [
        ['month', 'ASC'],
      ],
    });

    let carier = await Carier.findOne({ where: { studentId: element.id } });
    element.payments = payments;
    element.carier = carier;
    element.registration = registrations[0];

    res.send(element);
  });
});


router.get('/unrenewd/sucursal/:sucursalId', async (req, res) => {
  var newList = []
  let year = new Date().getFullYear()
   Student.findAll({
    raw: true, where: { sucursalId: req.params.sucursalId }, order: [
      ['createdAt', 'DESC'],
    ],
  }).then(function (students) {
    if(students.length==0){
      res.send([]);
    }
var size=students.length
    students.forEach(st => {
size--
       Registration.findOne({ raw:true, where: { studentId: st.id, year } }).then(function (reg) {
        //Retunr only if havent renewd 
        if (!reg) {
          Payment.findAll({
            raw: true, where: { studentId: st.id }, order: [
              ['month', 'ASC'],
            ],
          }).then(function (payments) {
            Carier.findOne({ where: { studentId: st.id } }).then(function (carier) {
              st.payments = payments;
              st.carier = carier;
              st.registration = reg;
              newList.push(st)
              if(size==0){
                res.send(newList);
              }
            })
          })
        }
      });
    })
  });

 
});


router.get('/all/sucursal/:sucursalId', async (req, res) => {
  var newList = []
  let year = new Date().getFullYear()
  await Student.findAll({
    raw: true, where: { sucursalId: req.params.sucursalId }, order: [
      ['createdAt', 'DESC'],
    ],
  }).then(function (students) {
    students.forEach(st => {
      Registration.findAll({ raw: true, where: { studentId: element.id } }).then(function (regs) {
       
          Payment.findAll({
            raw: true, where: { studentId: element.id }, order: [
              ['month', 'ASC'],
            ],
          }).then(function (payments) {
            Carier.findOne({ where: { studentId: element.id } }).then(function (carier) {
              st.payments = payments;
              st.carier = carier;
              st.registrations = regs;
              newList.push(st)
            })
          })
        
      });
    })
  });

  res.send(newList);
});

router.get('/count/all/students', async (req, res) => {
  Student.count()
    .then(function (total) {
      res.status(200).json({
        total: total
      });
    });
});

router.get('/unique/:id', async (req, res) => {
  Student.findOne({
    where: { id: req.params.id }
  }).then(function (student) {
    res.send(student);
  });
});

router.get('/uniquebystudentNumber/:studentNumber', async (req, res) => {
  Student.findOne({
    where: { studentNumber: req.params.studentNumber }
  }).then(function (student) {
    res.send(student);
  });
});

//Busca pela sucursal
router.get('/sucursal/:sucursalId/:page', async (req, res) => {
  var page = req.params.page;
  Student.findAll({ where: { sucursalId: req.params.sucursalId }, offset: (6 * page) - 6, limit: 6, order: 'createdAt DESC' }).then(function (students) {
    res.send(students);
  });
});

router.get('/sucursal/:sucursalId/', async (req, res) => {
  Student.findAll({ where: { sucursalId: req.params.sucursalId }, order: 'createdAt DESC' }).then(function (students) {
    res.send(students);
  });
});

router.get('/sucursal/:sucursalId/count/all/students', async (req, res) => {
  Student.count({ where: { sucursalId: req.params.sucursalId } })
    .then(function (total) {
      res.status(200).json({
        total: total
      });
    });
});

module.exports = router;