var fs = require('fs');
const express=require('express');
const router=express.Router();
var http = require("https");
const cron = require('node-cron');
const keys = require('../config/keys');
const Product=require('../models/product');


//Task que corre 1 em 1 hora 
var task =cron.schedule('1 * * * *', () => {
  var options = {
    "method": "GET",
    "hostname": "world.msg91.com",
    "port": 443,
    "path": `/api/sendhttp.php?mobiles=258822959881,258841153433&authkey=${keys.msg91AuthKey}&route=4&sender=GSTOCK&message=Ropture%20ede%20eStock%20epara%20eo%20eproducto`,
    "headers": {}
  };


  Product.findAll({order: 'creationdate DESC' }).then(function(products) {
  
  
  
  
  });  

  //Apenas se o stock estiver abaixo
  var req = http.request(options, function (res) {
    var chunks = [];
  
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });
  
    res.on("end", function () {
      var body = Buffer.concat(chunks);
      console.log(body.toString());
    });
  });
  
  req.end();


});


task.start();


  function diff_minutes(dt2, dt1) 
 {

  var diff =(dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));
  
 }
    
module.exports=router;