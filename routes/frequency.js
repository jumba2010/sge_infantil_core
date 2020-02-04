const express=require('express');
const Frequency=require('../models/frequency');
const router=express.Router();
 
//Cria Membro
router.post('/', async (req,res)=>{
    const {level,sucursalId,createdBy,activatedBy}=req.body; 
    Frequency.create({level,sucursalId,createdBy,activatedBy}).then(function(worker) {
        res.send(worker);
      })
});

//Actualiza Taxa
router.put('/:id', async (req,res)=>{
  const {registrationValue,monthlyPayment,specialHourMonthlyValue,recurigRegistrationValue,updatedBy}=req.body;
 
  Frequency.update(
      {registrationValue,monthlyPayment,specialHourMonthlyValue,recurigRegistrationValue,updatedBy},
      { where: { id:req.params.id} },
      {fields: ['specialHourMonthlyValue','recurigRegistrationValue','registrationValue','monthlyPayment','updatedBy']},
      
    )
      .then(result =>
          res.send(result)
      )
      .catch(err =>
        console.log(err)
      )    
});

//Actualiza Obreiro
router.put('/inativate/:id', async (req,res)=>{
  Frequency.update(
        { active:false,activationdate:Date.now(),activatedBy},
        {fields: ['active','activationDate',]},
        { where: { id:req.params.id} }
      )
        .then(result =>
            res.send(result)
        )
        .catch(err =>
          console.log(err)
        )    
});


router.get('/:sucursalId/:page', async (req,res)=>{
    var page=req.params.page;
 Frequency.findAll({where:{ sucursalId:req.params.sucursalId},offset: (6*page)-6, limit: 6,order: 'createdAt DESC' }).then(function(requencyes) {
        res.send(requencyes);
      });   
});

router.get('/:sucursalId', async (req,res)=>{
Frequency.findAll({where:{ sucursalId:req.params.sucursalId} }).then(function(requencyes) {
      res.send(requencyes);
    });   
});

//Busca total
router.get('/count/all/requencyes/:sucursalId', async (req,res)=>{   
  Frequency.count({where:{ sucursalId:req.params.sucursalId}})
.then(function(total) {
  res.status(200).json({
    total: total
  });
});
});

module.exports=router;