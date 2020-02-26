const express=require('express');
const Payment=require('../models/payment');
const Student=require('../models/student');
const Sucursal=require('../models/sucursal');
const sequelize=require('sequelize');
const router=express.Router();
 
//Cria Membro
router.post('/', async (req,res)=>{
  const {total,discount,studentId,limitDate,sucursal,year,registrationId,createdBy,month,sucursalCode,activatedBy}=req.body; 
  let p= await Payment.create({month,year,total,limitDate,discount,registrationId,studentId,sucursalId:sucursal.id,createdBy,activatedBy}
          )
      res.send(p);
    
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
  const {updatedBy,receiptNumber,paymentMethod,studentId}=req.body;  
  await  Payment.update(
  {status:1,paymentMethod,code:receiptNumber,paymentDate:Date.now(),updatedBy},  
  { where: { id:req.params.id} },    
       {fields: ['status','updatedBy','paymentDate','receiptNumber','paymentMethod']},
     
    )
      .then(result =>
          res.send(result)
      )
      .catch(err =>
        console.log(err)
      );
      
      await  Student.update(
        {syncStatus:1,updatedBy},
        { where: { id:studentId} },
        {fields: ['syncStatus','updatedBy']},
       
      );
});


router.put('/anull/:id', async (req,res)=>{
  const {updatedBy,studentId}=req.body;  
   Payment.update(
  {status:0,updatedBy},  
  { where: { id:req.params.id} },    
       {fields: ['status','updatedBy','paymentDate','receiptNumber','paymentMethod']},
     
    )
      .then(result =>
          res.send(result)
      )
      .catch(err =>
        console.log(err)
      )   
      
      await  Student.update(
        {syncStatus:1,updatedBy},
        { where: { id:studentId} },
        {fields: ['syncStatus','updatedBy']},
       
      );
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
router.get('/count/:sucursalId/:year/:month', async (req,res)=>{
  var newList=[];
  if(req.params.month==='0'){
    for (let index = 1; index < 12; index++) {
      const month = index;
      const studentsPaid = await Payment.count({
        where:{ sucursalId:req.params.sucursalId,year:req.params.year,month:month,status:1}
        });
      
        const studentsUnPaid = await Payment.count({
          where:{ sucursalId:req.params.sucursalId,year:req.params.year,month:month,status:0}
          });
      
          await  Payment.findAll({
            attributes: [[sequelize.fn('sum', sequelize.col('total')), 'total']],
            raw: true,  where:{ sucursalId:req.params.sucursalId,year:req.params.year,month:month,status:1}
          }).then(async function(paidValue) {
            await  Payment.findAll({
              attributes: [[sequelize.fn('sum', sequelize.col('total')), 'total']],
              raw: true,  where:{ sucursalId:req.params.sucursalId,year:req.params.year,month:month,status:0}
            }).then(function(unPaidValue) {
        
              if(studentsPaid!=0 || month<=(new Date()).getMonth() ){
  
              newList.push({month:month, studentsPaid:studentsPaid,studentsUnPaid:studentsUnPaid,paidValue:paidValue[0],unPaidValue:unPaidValue[0]})
            }
            })
          })  
         
    }

    res.json(newList);
    }
        else{

          const month = req.params.month
          const studentsPaid = await Payment.count({
            where:{ sucursalId:req.params.sucursalId,year:req.params.year,month:month,status:1}
            });
          
            const studentsUnPaid = await Payment.count({
              where:{ sucursalId:req.params.sucursalId,year:req.params.year,month:month,status:0}
              });
          
             await  Payment.findAll({
                attributes: [[sequelize.fn('sum', sequelize.col('total')), 'total']],
                raw: true,  where:{ sucursalId:req.params.sucursalId,year:req.params.year,month:month,status:1}
              }).then(async function(paidValue) {
                await     Payment.findAll({
                  attributes: [[sequelize.fn('sum', sequelize.col('total')), 'total']],
                  raw: true,  where:{ sucursalId:req.params.sucursalId,year:req.params.year,month:month,status:0}
                }).then(function(unPaidValue) {
            
                  if(studentsPaid!=0 || month<=(new Date()).getMonth() ){
      
                  newList.push({month:month, studentsPaid:studentsPaid,studentsUnPaid:studentsUnPaid,paidValue:paidValue[0],unPaidValue:unPaidValue[0]})
                  
                }
                })
              })  
          
    res.json(newList);
        }

  

 
  

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