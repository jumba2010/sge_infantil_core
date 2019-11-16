const bcrypt=require('bcrypt');
const _ = require('lodash');
const express=require('express');
const User=require('../models/user');
const router=express.Router();

//Cria Utilizador
router.post('/', async (req,res)=>{   
    const {username, password,activatedby,createdby}=req.body;
    const salt=await bcrypt.genSalt(10);
    let newpassword=await bcrypt.hash(password,salt);
      User.create({ username: username, password: newpassword,activatedby,createdby}).then(function(user) {
        res.send(_.pick(user,['id','username','active']));
      })   
});

router.put('/password', async (req,res)=>{   
    var {username, password,updatedBy}=req.body;
    const salt=await bcrypt.genSalt(10);
    password= await bcrypt.hash(password,salt);
    User.update(
        { password: password,updatedBy },
        {fields: ['password','updatedBy']},
        { where: { username:username,active:true } }
      )
        .then(result =>
            res.send(result)
        )
        .catch(err =>
          console.log(err)
        )    
   
});


module.exports=router;