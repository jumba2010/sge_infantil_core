const express = require('express');
const router = express.Router();
const crudService=require('../services/crudService');
const constants=require('../utils/constants');
const {convertToStringDate} = require('../utils/DatetimeUtils');

router.post('/', async (req, res) => {
  try{
   const   { name, sex, alergicToFood, alergicToMedicine, wasTransfered, oldSchool, 
      studentAddress, birthDate, docType, docNumber, motherContact, fatherContact,
       motherName, fatherName, picture, currentMonthlyPayment, level, sucursalId, 
       sucursal, createdBy, activatedBy,carier } = req.body;

    const studentPayload =  {sucursalId:sucursal.id,  name,carier, address: studentAddress, alergicToFood, wasTransfered, oldSchool, alergicToMedicine, sex, birthDate, docType, docNumber, motherContact, fatherContact, motherName, fatherName, picture, currentMonthlyPayment, level, sucursalId, createdBy, activatedBy }
    studentPayload.birthDate =convertToStringDate(new Date(birthDate));
    const resp= await crudService.create(constants.STUDENT_TABLE,studentPayload)
    res.send(resp)
   }
   catch(err){
     console.log(err)
     res.status(500).json({error:err})
   }
    
});

router.put('/:id', async (req, res) => {

    const { name, alergicToFood,
      alergicToMedicine,
      registrationId, oldSchool, address, sex,
      birthDate, docType, docNumber,
      motherName, fatherName,
      motherContact, fatherContact,
      level, updatedBy } = req.body;

      let studentPayload ={name, alergicToFood,
        alergicToMedicine,
        registrationId, oldSchool, address, sex,
        birthDate, docType, docNumber,
        motherName, fatherName,
        motherContact, fatherContact,
        level, updatedBy }
        studentPayload.birthDate = convertToStringDate(new Date(birthDate));
      studentPayload.carier= { name:  req.body.carierName, kinshipDegree: req.body.kinshipDegree, syncStatus: 1, contact: req.body.contact , workPlace: req.body.workPlace, updatedBy };
      
      try{

         await crudService.update(constants.STUDENT_TABLE,req.params.id,studentPayload);

        let newStudent = await crudService.readById(constants.STUDENT_TABLE,req.params.id);
    
        let registrationPayload = {student: newStudent};

         await crudService.update(constants.REGISTRATION_TABLE,req.body.registrationId,registrationPayload);
   
        res.status(200).send({message:'Updateed successfully'})
       }
       catch(err){
         console.log(err) 
         res.status(500).json({error:err})
       }
});

router.put('/inativate/:id', async (req, res) => {
  const { payments, registrationId } = req.body;
  await crudService.inactivate(constants.STUDENT_TABLE,req.params.id);
  await crudService.inactivate(constants.REGISTRATION_TABLE,registrationId);
  //inactivate each payment
  for (let i = 0; i < payments.length; i++) {
    await crudService.inactivate(constants.PAYMENT_TABLE,payments[i].id );
  }

  res.status(200).send({message:'Inactivated successfully'})
});




router.get('/unrenewd/sucursal/:sucursalId', async (req, res) => {
  let year = new Date().getFullYear();

  let students = await crudService.queryBySucursalId(constants.STUDENT_TABLE, req.params.sucursalId);
  
  let registrations = await crudService.queryBySucursalIdAnYear(constants.REGISTRATION_TABLE, req.params.sucursalId, year);
  
  // Create a list of studentIds from the registrations list
  const registeredStudentIds = registrations.map(registration => registration.student.id);
  
  // Filter students to include only those who are not in the registrations list
  const unregisteredStudents = students.filter(student => !registeredStudentIds.includes(student.id));

  return res.send(unregisteredStudents);
});


router.get('/history/sucursal/:sucursalId', async (req, res) => {
  let newList = []
  
  let students = await crudService.queryBySucursalId(constants.STUDENT_TABLE,req.params.sucursalId);

  for(var i=0;i<students.length;i++){
     let st=students[i]
     let registrations =  await crudService.findCurrentByStudentId(constants.REGISTRATION_TABLE,st.id,req.params.sucursalId);
     registrations.forEach(async reg=>{
     let payments= await crudService.findPaymentsByRegistrationId(reg.id,req.params.sucursalId);
     reg.payments=payments
     })
     st.registrations = registrations;
     newList.push(st)

     if(i==students.length-1){
      res.send(newList);
     }
      
    }
});


module.exports = router;