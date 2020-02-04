const express=require('express');
const Payment=require('../models/payment');
const Student=require('../models/student');
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
router.put('/pay/:id', async (req,res)=>{
  const {updatedBy,receiptNumber,paymentMethod}=req.body;  
   Payment.update(
  {status:1,paymentMethod,code:receiptNumber,paymentDate:Date.now(),updatedBy},  
  { where: { id:req.params.id} },    
       {fields: ['status','updatedBy','paymentDate','receiptNumber','paymentMethod']},
     
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

router.get('/unique/:id', async (req,res)=>{
  Payment.findOne({where:{id:req.params.id}}).then(function(payment) {
        res.send(payment);
      });   
  });

router.get('/mypayments/:studentId', async (req,res)=>{
  Payment.findAll({where:{studentId:req.params.studentId}, order: [
    ['month', 'ASC'],
],}).then(function(payments) {
        res.send(payments);
      });   
  });

  router.get('/unpaid/:sucursalId', async (req,res)=>{
         
        Payment.findAll({raw: true,where:{sucursalId:req.params.sucursalId,status:0,hasFine:true}, order: [
          ['year', 'ASC'], ['month', 'ASC']
      ],}).then(async function(payments) {
             var newList=[]
              for (let index = 0; index < payments.length; index++) {
                const element = payments[index];
               let student=await  Student.findOne({where:{id:payments[index].studentId}
               });   
               element.student=student;
              newList.push(element)   
               
              }   
               res.send(newList);
           
            }); 
    });

    router.get('/paid/:sucursalId/:year', async (req,res)=>{
      Payment.findAll({raw: true,where:{sucursalId:req.params.sucursalId,year:req.params.year,status:1}, order: [
        ['year', 'ASC'], ['month', 'ASC']
    ],}).then(async function(payments) {
           var newList=[]
            for (let index = 0; index < payments.length; index++) {
              const element = payments[index];
             let student=await  Student.findOne({where:{id:payments[index].studentId}
             });   
             element.student=student;
            newList.push(element)   
             
            }   
             res.send(newList);
         
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