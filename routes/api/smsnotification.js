var fs = require('fs');
const express = require('express');
const router = express.Router();
const Configuration = require('../../models/paymentconfig');
const Carier = require('../../models/carier');
const SentMessage = require('../../models/sentmessage');
const Student = require('../../models/student');
var http = require("https");
const keys = require('./../../config/keys');
var qs=require('querystring');

//Cria Membro
router.post('/carrier', async (req,res)=>{
    const {message,studentIds,sucursalId}=req.body; 
    let conf = await Configuration.findOne({
        where: { sucursalId: sucursalId}
    })
 
    for (let index = 0; index < studentIds.length; index++) {
        carier = await Carier.findOne({
            where: { studentId: studentIds[index] }
        });

        await sendNotification('258' + carier.contact,message , conf.smsSenderID,studentIds[index],sucursalId);
    }
});

router.get('/sucursal/:sucursalId', async (req,res)=>{
    SentMessage.findAll({raw: true,where:{ sucursalId:req.params.sucursalId} , order: [
      ['createdAt', 'DESC'],
    ], }).then( async function(sentmessages) {
    
      var newList=[]
      for (let index = 0; index < sentmessages.length; index++) {
        const element = sentmessages[index];

    let student=await Student.findOne({where:{id:element.studentId}});
        element.student=student;
        newList.push(element)
       
      }
          res.send(newList);
        });   
    });


async function sendNotification(cellphone, message, senderId,studentId,sucursalId) {

    let stringfyedMessage=encodeURI(message); 
    var options = {
        "method": "GET",
        "hostname": "world.msg91.com",
        "port": 443,
        "path": `/api/sendhttp.php?mobiles=${cellphone}&authkey=${keys.msg91AuthKey}&unicode=1&route=4&sender=${senderId}&message=${stringfyedMessage}`,
        "headers": {}
    };

    var req = http.request(options, async function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", async function () {
            var body = Buffer.concat(chunks);
            let requestId=body.toString();
          let m= await SentMessage.create({sucursalId,studentId,requestId,message,senderId,number:cellphone}
                );

                console.log('Mensagens enviadas com sucesso');
        });
    });

    req.end();

}

module.exports = router;