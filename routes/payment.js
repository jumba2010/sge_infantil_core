const express=require('express');
const router=express.Router();
const crudService=require('../services/crudService');
const constants=require('../utils/constants');
 
router.post('/', async (req,res)=>{
  try{
    const paymentPayload = {total,discount,studentId,limitDate,sucursal,year,registrationId,createdBy,month,sucursalCode,activatedBy}=req.body;
    const resp= await crudService.create(constants.PAYMENT_TABLE,paymentPayload)
    res.send(resp)
   }
   catch(err){
     console.log(err)
     res.status(500).json({error:err})
   }
    
});



router.put('/pay/:id', async (req,res)=>{
  const {updatedBy,receiptNumber,paymentMethod,payments,registrationId}=req.body;  
  const payload = {status:1,paymentMethod,code:receiptNumber,paymentDate:Date.now(),updatedBy}
  console.log('All',payments)
  try{
   
    await crudService.update(constants.PAYMENT_TABLE,req.params.id,payload)

    const updatedPayments = payments.map((payment) => {
      if (payment.id === req.params.id) {
        console.log('Match',payment.id )
        return { ...payment, status: 1 };
      }
      return payment;
    });

    let paymentsPayload= {payments:updatedPayments}

   

    await crudService.update(constants.REGISTRATION_TABLE,registrationId,paymentsPayload);
    res.status(200).send({message:"Payment made successfully"})
  }
  catch(err){
    console.log(err)
    res.status(500).json({error:err})
  } 

});


router.put('/anull/:id', async (req,res)=>{
  const {payments,registrationId}=req.body;  
  const payload={status:0}

  try{
   
    await crudService.update(constants.PAYMENT_TABLE,req.params.id,payload)

    const updatedPayments = payments.map((payment) => {
      if (payment.id === req.params.id) {
        return { ...payment, status: 0 };
      }
      return payment;
    });

    console.log(updatedPayments)

    let paymentsPayload= {payments:updatedPayments}

    await crudService.update(constants.REGISTRATION_TABLE,registrationId,paymentsPayload);
    res.status(200).send({message:"Payment made successfully"})
  }
  catch(err){
    console.log(err)
    res.status(500).json({error:err})
  } 

});


  router.get('/unpaid/:sucursalId', async (req,res)=>{   
    const response=await crudService.queryUnpaidBySucursalId(constants.PAYMENT_TABLE,req.params.sucursalId)   
    res.status(200).send(response);
    });

    router.get('/paid/:sucursalId', async (req,res)=>{
      const response=await crudService.queryBySucursalIdAndStatusAndYear(constants.PAYMENT_TABLE,req.params.sucursalId,1,new Date().getFullYear())   
      res.status(200).send(response);         
      
        });


  router.get('/count/:sucursalId/:year/:month', async (req,res)=>{
      
    const year = parseInt(req.params.year);
    const month =parseInt(req.params.month); 
    const currentMonth = new Date().getMonth() + 1;
    const monthCounts = [];

    if(month===0){
      for (let month = 1; month <= currentMonth; month++) {
      const studentsPaid = await crudService.getMonthCounts(req.params.sucursalId, year, month, 1);
      const studentsUnPaid = await crudService.getMonthCounts(req.params.sucursalId, year, month, 0);
      
      if(studentsPaid!=0){
        const paidValue = await crudService.getMonthTotalAmount(req.params.sucursalId, year, month, 1);
        const unPaidValue = await crudService.getMonthTotalAmount(req.params.sucursalId, year, month, 0);
        monthCounts.push({month:""+month, studentsPaid, studentsUnPaid,paidValue,unPaidValue});
      }
      
      }

    }
    else{
      const studentsPaid = await crudService.getMonthCounts(req.params.sucursalId, year, month, 1);
      const studentsUnPaid = await crudService.getMonthCounts(req.params.sucursalId, year, month, 0);

     if(studentsPaid!=0 ){
        const paidValue = await crudService.getMonthTotalAmount(req.params.sucursalId, year, month, 1);
        const unPaidValue = await crudService.getMonthTotalAmount(req.params.sucursalId, year, month, 0);
        monthCounts.push({month:""+month, studentsPaid, studentsUnPaid,paidValue,unPaidValue});
      }
      
    }
  
    res.json(monthCounts);     
  
  })
                

module.exports=router;