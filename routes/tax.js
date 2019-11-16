const express=require('express');
const Tax=require('../models/tax');
const router=express.Router();
 
router.post('/', async (req,res)=>{
    const {startDate,registrationValue,monthlyPayment,classId,createdBy,activatedby}=req.body; 
    Tax.create({startDate,registrationValue,monthlyPayment,classId,createdBy,activatedby}).then(function(worker) {
        res.send(worker);
      })
});

router.put('/:id', async (req,res)=>{
  const {startDate,registrationValue,monthlyPayment,classId,updatedBy}=req.body;  
  Tax.update(
      {startDate,registrationValue,monthlyPayment,classId,updatedBy},
      {fields: ['startDate','registrationValue','monthlyPayment','classId','updatedBy']},
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
  Tax.update(
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

router.get('/:classId', async (req,res)=>{
Tax.findOne({where:{ classId:req.params.classId}, order: 'createdAt DESC' }).then(function(tax) {
      res.send(tax);
    });   
});


module.exports=router;