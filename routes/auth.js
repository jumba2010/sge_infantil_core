const config=require('config');
const jwt=require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const Joi = require('joi');
const express=require('express');
const User=require('../models/user');
const LoginInfo=require('../models/logininfo');
const router=express.Router();

//Autenticar Utilizador
router.post('/', async (req,res)=>{   
   
    const { password, userName } = req.body;
  
    // Valida a existencia do user
    let user=await User.findOne({ where: {username:userName,active: true} });  
    if(!user) return res.status(400).send('Invalid username or  password');
    const validPassword=await bcrypt.compareSync(password,user.password);
if(!validPassword) return res.status(400).send('Invalid username or  password');

    const token=await jwt.sign({_id:user._id,username:user.username,profile:user.profile,transactions:user.transactions,name:user.name,picture:user.picture,email:user.email},config.get('jwtPrivateKey'));
   
    res.send(token); 
    
});

module.exports=router;