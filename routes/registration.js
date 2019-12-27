const express=require('express');
const Registration=require('../models/registration');
const Payment=require('../models/payment');
const Configuration = require('../models/paymentconfig');
var moment = require('moment');
const router=express.Router();
 
//Cria Membro
router.post('/', async (req,res)=>{
    const {totalPaid,monthlyPayment,discount,isNew,needSpecialTime,studentId,sucursal,classId,year,createdBy,activatedBy}=req.body; 
  
    Registration.create({totalPaid,monthlyPayment,discount,isNew,needSpecialTime,studentId,sucursalId:sucursal.id,classId,createdBy,activatedBy}
      ).then(async function(registration) { 

        console.log(sucursal)
        
        let initialMont=sucursal.code==='MT_01'?2:1; 
        let today = new Date();
          //Verifica se esta  iscrição está sendo feita após a data de inicio das aulas
          let configuration = await Configuration.findOne({
            where: { sucursalId: sucursal.id }
        });

        for(i=initialMont; i<=11;i++){
          let limitDate=moment([year, i, configuration.paymentEndDay+1])
          limitDate.utc().format("YYYY-MM-DD");       
          Payment.create({month:i,year,total:monthlyPayment,limitDate:limitDate.utc().format("YYYY-MM-DD"),discount,registrationId:registration.id,studentId,sucursalId:sucursal.id,createdBy,activatedBy}
            )
        }
  

        res.send(registration);

        
        
      
  
       
      })
});


router.put('/:id', async (req,res)=>{
  const {totalPaid,discount,newStudennt,studentId,sucursalId,classId,updatedBy}=req.body;  
  Registration.update(
      {totalPaid,discount,newStudennt,studentId,sucursalId,classId,updatedBy},      
       {fields: ['totalPaid','newStudennt','studentId','sucursalId','discount','classId','updatedBy']},
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
  Registration.update(
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
 Registration.findAll({offset: (6*page)-6, limit: 6,order: 'createdAt DESC' }).then(function(registrations) {
        res.send(registrations);
      });   
});

router.get('/', async (req,res)=>{
Registration.findAll({order: 'createdAt DESC' }).then(function(registrations) {
      res.send(registrations);
    });   
});

router.get('/count/all/registrations', async (req,res)=>{   
  Registration.count()
.then(function(total) {
  res.status(200).json({
    total: total
  });
});
});

router.get('/betwen/:startdate/:endDate/:page', async (req,res)=>{
  var page=req.params.page;
  Registration.findAll({ where: {
    createdAt: {
    $between: [req.params.startdate, req.params.enddate],
  }
}, 
  
  offset: (6*page)-6, limit: 6,order: 'createdAt DESC' }).then(function(registrations) {
      res.send(registrations);
    });   
});

router.get('/count/betwen/:startdate/:endDate', async (req,res)=>{   
  Registration.count({where: {
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


  //Busca por Sucursal
  router.get('/sucursal/:sucursalId/:page', async (req,res)=>{
    var page=req.params.page;
 Registration.findAll({where:{ sucursalId:req.params.sucursalId},offset: (6*page)-6, limit: 6,order: 'createdAt DESC' }).then(function(registrations) {
        res.send(registrations);
      });   
});

router.get('/sucursal/:sucursalId', async (req,res)=>{
Registration.findAll({where:{ sucursalId:req.params.sucursalId},order: 'createdAt DESC' }).then(function(registrations) {
      res.send(registrations);
    });   
});

router.get('/sucursal/:sucursalId/count/all/registrations', async (req,res)=>{   
  Registration.count({where:{ sucursalId:req.params.sucursalId}})
.then(function(total) {
  res.status(200).json({
    total: total
  });
});
});

router.get('/sucursal/:sucursalId/betwen/:startdate/:endDate/:page', async (req,res)=>{
  var page=req.params.page;
  Registration.findAll({ where: {
    createdAt: {
    $between: [req.params.startdate, req.params.enddate],
  },
  sucursalId:req.params.sucursalId
}, 
  
  offset: (6*page)-6, limit: 6,order: 'createdAt DESC' }).then(function(registrations) {
      res.send(registrations);
    });   
});

router.get('/sucursal/:sucursalId/count/betwen/:startdate/:endDate', async (req,res)=>{   
  Registration.count({where: {
    createdAt: {
      $between: [req.params.startdate, req.params.enddate],
    },
    sucursalId:req.params.sucursalId
  }})
  .then(function(total) {
  res.status(200).json({
    total: total
  });
  }); 
  });



module.exports=router;