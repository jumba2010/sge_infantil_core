const config=require('config');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const _ = require('lodash');
const Joi = require('joi');
const express=require('express');
const User=require('../models/user');
const router=express.Router();

//Autenticar Utilizador
router.post('/', async (req,res)=>{   
   
    const { password, userName, type } = req.body.params;
      if (password === 'ant.design' && userName === 'admin') {
        return res.send({
        status: 'ok',
        type,
        currentAuthority: 'admin',
      });
      
    }
   if (password === 'ant.design' && userName === 'user') {
    return res.send({
        status: 'ok',
        type,
        currentAuthority: 'user',
      });
    
    }

    if(password !== 'ant.design'){
        console.log('invalido')
    res.send({
      status: 'error',
      type,
      currentAuthority: 'guest',
    });
}
  /*   // Valida a existencia do user
    let user=await User.findOne({ where: {username:req.body.userName,active: true} });

    if(!user) return res.status(400).send('Invalid username or  password');
    const validPassword=await bcrypt.compare(req.body.password,user.password);
    if(!validPassword) return res.status(400).send('Invalid username or  password');
    const token=await jwt.sign({_id:user._id,username:user.username,profile:user.profile,transactions:user.transactions,name:user.name,picture:user.picture,email:user.email},config.get('jwtPrivateKey'));

    res.send(token); */
    
});


module.exports=router;