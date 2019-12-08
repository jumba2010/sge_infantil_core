const express=require('express');
const Student=require('../models/student');
const Payment=require('../models/payment');
const router=express.Router();
 
router.post('/', async (req,res)=>{
    const {name,address,sex,birthDate,docType,docNumber,motherContact,fatherContact,motherName,fatherName,picture,currentMonthlyPayment,level,sucursalId,createdBy,activatedBy}=req.body; 
    Student.create({name,address,sex,birthDate,docType,docNumber,motherContact,fatherContact,motherName,fatherName,picture,currentMonthlyPayment,level,sucursalId,createdBy,activatedBy}).then(function(student) {
        res.send(student);
      })
});

router.put('/:id', async (req,res)=>{
  const {name,address,sex,birthDate,docType,docNumber,studentNumber,motherName,fatherName,picture,currentMonthlyPayment,level,updatedBy}=req.body;  
  Student.update(
      {name,address,sex,birthDate,docType,docNumber,studentNumber,motherName,currentMonthlyPayment,level,fatherName,picture,updatedBy},
      {fields: ['name','address','sex','birthDate','docType','docNumber','currentMonthlyPayment','level','studentNumber','motherName','fatherName','updatedBy','picture']},
      { where: { id:req.params.id} }
    )
      .then(result =>
          res.send(result)
      )
      .catch(err =>
        console.log(err)
      )    
});

router.put('/inativate/:id', async (req,res)=>{
  Student.update(
        { active:false,activationDate:Date.now(),activatedBy},
        {fields: ['active','activationDate','activatedBy']},
        { where: { id:req.params.id} }
      )
        .then(result =>
            res.send(result)
        )
        .catch(err =>
          console.log(err)
        )    
});

router.get('/:page', async (req,res)=>{
    var page=req.params.page;
 Student.findAll({offset: (6*page)-6, limit: 6,order: 'createdAt DESC' }).then(function(students) {
        res.send(students);
      });   
});

router.get('/sucursal/:sucursalId', async (req,res)=>{
Student.findAll({raw: true,where:{ sucursalId:req.params.sucursalId} }).then( async function(students) {

  var newList=[]
  for (let index = 0; index < students.length; index++) {
    const element = students[index];
   let payments=await Payment.findAll({ raw: true,where:{studentId:element.id}, order: [
       ['month', 'ASC'],
], });
    element.payments=payments;
    newList.push(element)
   
  }
      res.send(newList);
    });   
});

router.get('/count/all/students', async (req,res)=>{   
  Student.count()
.then(function(total) {
  res.status(200).json({
    total: total
  });
});
});

router.get('/unique/:id', async (req,res)=>{
  Student.findOne({where:{id:req.params.id}
}).then(function(student) {
        res.send(student);
      });   
  });

//Busca pela sucursal
router.get('/sucursal/:sucursalId/:page', async (req,res)=>{
  var page=req.params.page;
Student.findAll({where:{ sucursalId:req.params.sucursalId},offset: (6*page)-6, limit: 6,order: 'createdAt DESC' }).then(function(students) {
      res.send(students);
    });   
});

router.get('/sucursal/:sucursalId/', async (req,res)=>{
Student.findAll({where:{ sucursalId:req.params.sucursalId},order: 'createdAt DESC' }).then(function(students) {
    res.send(students);
  });   
});

router.get('/sucursal/:sucursalId/count/all/students', async (req,res)=>{   
Student.count({where:{ sucursalId:req.params.sucursalId}})
.then(function(total) {
res.status(200).json({
  total: total
});
});
});

module.exports=router;