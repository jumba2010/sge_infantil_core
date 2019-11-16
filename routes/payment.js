const express=require('express');
const Payment=require('../models/payment');
const router=express.Router();
 
//Cria Membro
router.post('/', async (req,res)=>{
    const {month,year,total,fine,discount,status,registrationId,createdBy,activatedBy}=req.body; 
    Payment.create({month,year,total,fine,discount,status,registrationId,createdBy,activatedBy}
      ).then(function(worker) {
        res.send(worker);
      })
});

//Actualiza Obreiro
router.put('/:id', async (req,res)=>{
  const {month,year,total,fine,discount,status,registrationId,updatedBy}=req.body;  
  Payment.update(
      {month,year,total,fine,discount,status,registrationId,updatedBy},      
       {fields: ['month','year','total','fine','discount','status','registrationId','updatedBy']},
      { where: { id:req.params.id} }
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
  Payment.update(
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

//Busca Todos os Membros
router.get('/:page', async (req,res)=>{
    var page=req.params.page;
 Payment.findAll({offset: (6*page)-6, limit: 6,order: 'createdAt DESC' }).then(function(payments) {
        res.send(payments);
      });   
});

//Busca Todos os Membros
router.get('/', async (req,res)=>{
Payment.findAll({order: 'createdAt DESC' }).then(function(payments) {
      res.send(payments);
    });   
});

//Busca total
router.get('/count/all/payments', async (req,res)=>{   
  Payment.count()
.then(function(total) {
  res.status(200).json({
    total: total
  });
});
});

router.get('/betwen/:startdate/:endDate/:page', async (req,res)=>{
  var page=req.params.page;
  Payment.findAll({ where: {
    createdAt: {
    $between: [req.params.startdate, req.params.enddate],
  }
}, 
  
  offset: (6*page)-6, limit: 6,order: 'createdAt DESC' }).then(function(payments) {
      res.send(payments);
    });   
});

router.get('/count/betwen/:startdate/:endDate', async (req,res)=>{   
  Payment.count({where: {
    createdAt: {
      $between: [req.params.startdate, req.params.enddate],
    }
  }})
  .then(function(total) {
  res.status(200).json({
    total: total
  });
  }); 
  });


module.exports=router;