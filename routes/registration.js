const express = require('express');
var moment = require('moment');
const router = express.Router();

const crudService = require('../services/crudService');
const constants = require('../utils/constants');
const {transformMapToList} = require('../utils/DynamoDBUpdaterUtil')

const {convertToStringDate}=require('../utils/DatetimeUtils');

//Cria Inscricao
router.post('/', async (req, res) => {
  const payload = req.body;
  const {sucursal}=req.body;
  payload.sucursalId=sucursal.id;
  delete payload.sucursal;

  let year = new Date().getFullYear();
  let curentMonth =  new Date().getMonth()+1 
  payload.year =year

  try{
    const registration= await crudService.create(constants.REGISTRATION_TABLE,payload)
    let configurations = await crudService.queryBySucursalId(constants.PAYMENTCONFIG_TABLE,sucursal.id);
    let configuration=configurations[0]
    let payments = []

    var initialMonth = parseInt(configuration.initialMonth);

    //Start generating payments from curent month after initial month from configuration
    if(initialMonth<curentMonth) initialMonth = curentMonth;

    for (i = initialMonth; i <= 11; i++) {
      const limitDate = moment([year, i - 1, parseInt(configuration.paymentEndDay)]).toISOString();
      const paymentPayload={ month: i, year, status:0, total: payload.monthlyPayment, limitDate:convertToStringDate(new Date (limitDate)),
       discount:payload.discount, registrationId: registration.id, student:payload.student, sucursalId: sucursal.id,
       createdBy:payload.createdBy, activatedBy:payload.activatedBy };
       let payment = await crudService.create(constants.PAYMENT_TABLE,paymentPayload);
       payments.push(payment);
    }

    //Update  payments
    let paymentsPayload= {payments:payments}
    await crudService.update(constants.REGISTRATION_TABLE,registration.id,paymentsPayload);
    res.send(registration)
   }
   catch(err){
     console.log(err)
     res.status(500).json({error:err})
   }

});

//Renova a inscricao
router.post('/renew', async (req, res) => {
  const payload = req.body;
  const {sucursal}=req.body;
  payload.sucursalId=sucursal.id;
  delete payload.sucursal;
  payload.year = new Date().getFullYear();
  let payments = []

  try{
    const registration= await crudService.create(constants.REGISTRATION_TABLE,payload);
    await crudService.update(constants.STUDENT_TABLE,payload.student.id,{level:payload.level})
    let configurations = await crudService.queryBySucursalId(constants.PAYMENTCONFIG_TABLE,payload.sucursalId);
    let configuration=configurations[0]
    var year = parseInt(payload.year);
    for (var i = parseInt(configuration.initialMonth); i <= 11; i++) {
      let limitDate = moment([year, (i - 1), parseInt(configuration.paymentEndDay) + 1])
      const paymentPayload = { month: i, year, 
        total: parseFloat(payload.monthlyPayment), 
        limitDate: limitDate.utc().format("YYYY-MM-DD"), 
        discount:parseFloat(payload.discount), 
        registrationId: registration.id, student:payload.student, 
        sucursalId: sucursal.id, 
        createdBy:payload.createdBy, 
        activatedBy:payload.activatedBy,
        status: i == parseInt(configuration.initialMonth) && payload.payFirstMonth? 1:0
      };

      let payment = await crudService.create(constants.PAYMENT_TABLE,paymentPayload);
       payments.push(payment);
    }
    
    let paymentsPayload= {payments:payments}
    await crudService.update(constants.REGISTRATION_TABLE,registration.id,paymentsPayload);

    res.send(registration)
   }
   catch(err){
     console.log(err)
     res.status(500).json({error:err})
   }

});


router.get('/current/:sucursalId', async (req, res) => {
  let year = new Date().getFullYear();
  let registrations= await crudService.findySucursalIdAnYear(constants.REGISTRATION_TABLE,req.params.sucursalId,year);
  registrations.sort((a, b) => {
    const dateA = new Date(a.createdAt.replace(' ', 'T')); // Replace space with 'T' for correct parsing
    const dateB = new Date(b.createdAt.replace(' ', 'T'));
    return dateB-dateA ;
  });

  let newList = await composeRegistrations(registrations);
  res.send(newList)

});

async function composeRegistrations(registrations) {
  const newList = [];
  for (let index = 0; index < registrations.length; index++) {
    const registration = registrations[index];
    let payments = transformMapToList(registration.payments);
    registration.payments = payments;
    newList.push(registration);
  }
  return newList;
}


router.get('/:registrationId', async (req, res) => {
  let registration= await crudService.readById(constants.REGISTRATION_TABLE,req.params.registrationId);
  res.send(registration)

});


module.exports = router;