const express=require('express');
const Student=require('../models/student');
const router=express.Router();
 
router.post('/', async (req,res)=>{
    const {name,address,sex,birthDate,docType,docNumber,studentNumber,motherName,fatherName,picture,createdBy,activatedby}=req.body; 
    Student.create({name,address,sex,birthDate,docType,docNumber,studentNumber,motherName,fatherName,picture,createdBy,activatedby}).then(function(worker) {
        res.send(worker);
      })
});

router.put('/:id', async (req,res)=>{
  const {name,address,sex,birthDate,docType,docNumber,studentNumber,motherName,fatherName,picture,updatedBy}=req.body;  
  Student.update(
      {name,address,sex,birthDate,docType,docNumber,studentNumber,motherName,fatherName,picture,updatedBy},
      {fields: ['name','address','sex','birthDate','docType','docNumber','studentNumber','motherName','fatherName','updatedBy','picture']},
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

router.get('/', async (req,res)=>{
Student.findAll({order: 'createdAt DESC' }).then(function(students) {
      res.send(students);
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