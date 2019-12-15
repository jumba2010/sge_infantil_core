const express=require('express');
const LoginInfo=require('../models/logininfo');
const router=express.Router();
 
//Cria Membro
router.post('/', async (req,res)=>{
    const {ipaddress,macaddress,location,device,userId}=req.body; 
    LoginInfo.create({ipaddress,macaddress,location,device,userId}
      ).then(function(logininfo) {
        res.send(logininfo);
      })
});

//Actualiza duracao
router.put('/:id', async (req,res)=>{
  const {month,year,total,fine,discount,status,registrationId,updatedBy}=req.body;  
  LoginInfo.update(
      {duration},  
      { where: { id:req.params.id} },    
       {fields: ['duration']},
     
    )
      .then(result =>
          res.send(result)
      )
      .catch(err =>
        console.log(err)
      )    
});
 
router.get('/:userId', async (req,res)=>{         
 LoginInfo.findAll({raw: true,where:{userId:req.params.userId}, order: [
          ['loginDate', 'DESC']
      ],}).then(async function(logininfo) {       
    res.send(logininfo);
           
            }); 
    });


module.exports=router;