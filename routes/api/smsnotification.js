var fs = require('fs');
const express = require('express');
const router = express.Router();
const Configuration = require('../../models/paymentconfig');
const Carier = require('../../models/carier');
var http = require("https");
const keys = require('./../../config/keys');

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

        let stringfyedMessage=encodeURIComponent(message);
        console.log(stringfyedMessage)


        await sendNotification('258' + carier.contact,stringfyedMessage , conf.smsSenderID);
    }
});


function sendNotification(cellphone, message, senderId) {
    let path= `/api/sendhttp.php?mobiles=${cellphone}&authkey=${keys.msg91AuthKey}&route=4&sender=${senderId}&message=${message}`;
  console.log('Path: ',path);
    var options = {
        "method": "GET",
        "hostname": "world.msg91.com",
        "port": 443,
        "path": `/api/sendhttp.php?mobiles=${cellphone}&authkey=${keys.msg91AuthKey}&route=4&sender=${senderId}&message=${message}`,
        "headers": {}
    };

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

}

module.exports = router;