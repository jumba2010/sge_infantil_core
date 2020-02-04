var fs = require('fs');
const express = require('express');
const router = express.Router();

const cron = require('node-cron');
const Configuration = require('../../models/paymentconfig');
const Payment = require('../../models/payment');
var moment = require('moment');
const Carier = require('../../models/carier');
var https = require("https");
const keys = require('../../config/keys');
const months=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
//Task que corre 5 em 5 minutos
var task = cron.schedule('*/1 * * * *', async () => {
    console.log('Iniciando a task de caculo de multa e notificações');
    //Busca todas configuracoes de Mensagens
    let configurations = await Configuration.findAll({
        raw: true, order: [
            ['id', 'ASC']
        ],
    })

    for (let index = 0; index < configurations.length; index++) {
        const conf = configurations[index];
        console.log('Processando a configuracao da sucursal ' + conf.sucursalId);
        console.log('Dia de inicio é ' + conf.paymentStartDay);
        let today = new Date();
        console.log('O dia de  hoje é ' + today.getDate());

        if (today.getDate() >= conf.paymentStartDay) {
            // 1. Buscar todos os Pagamentos cuja data de inicio eh igual a data actual
            let payments = await Payment.findAll({ where: { month: today.getMonth()+2, year: today.getFullYear(), sucursalId: conf.sucursalId, sentNotifications: 0 } });
            console.log(`Encontrou ${payments.length} pagamentos para o mês de ${today.getMonth()+2} do ano de ${today.getFullYear()} na sucural ${conf.sucursalId}`);
            for (let index = 0; index < payments.length; index++) {
                const payment = payments[index];
                //2. Para cada Pagamento enviar a primeira notificacao de Pagamento (depois sinalizar o pagamento como sendo notificado )
                carier = await Carier.findOne({
                    where: { studentId: payment.studentId }
                });

                console.log('Enviando notificação para ' + carier.contact)
                let nextMonth=months[payment.month-1];
                let endDay=conf.paymentEndDay;

              //  let stringfyedMessage=encodeURIComponent(`Caro Encarregado, vimos por meio deste informar que a mensalidade referente ao mes de ${nextMonth} ja esta em cobranca, ate ao dia ${endDay} de ${nextMonth}. Faca ja o seu pagamento. Evite multas. Obrigado. `);

              //  await sendNotification('258' + carier.contact,stringfyedMessage , conf.smsSenderID);
                 

                await Payment.update(
                    { sentNotifications: 1, updatedBy: 1 },
                    { where: { id: payment.id } },
                    { fields: ['sentNotifications', 'updatedBy'] },
                   
                )

                console.log('Notificacao enviada para o numero ' + carier.contact)

            }


        }//Fim do fluxo de envio da primeira notificacao

        //3. Buscar todos os pagamentos que estão a dois dias de expirar o prazo de pagamento e que ainda nao tenham sido notificados a segunda vez, enviar a notificacao e sinalizar
        let limitDate=moment([today.getFullYear(), today.getMonth(), today.getDate()+3])

        console.log('Data limite por comparar',limitDate.utc().format("YYYY-MM-DD"));
          
        let payments2 = await Payment.findAll({ where: { limitDate: limitDate.utc().format("YYYY-MM-DD"), sucursalId: conf.sucursalId, sentNotifications: 1 } });
        console.log(`Encontrou ${payments2.length} pagamentos que estao a dois dias do limite na sucural ${conf.sucursalId}`);
        for (let index = 0; index < payments2.length; index++) {
            const payment = payments2[index];

            //2. Para cada Pagamento enviar a segunda notificacao de Pagamento (depois sinalizar o pagamento como sendo notificado )
            carier = await Carier.findOne({
                where: { studentId: payment.studentId }
            });
            let currentMonth=months[payment.month];
            console.log('Enviando notificação para ' + carier.contact)
           // let stringfyedMessage=encodeURIComponent(`Caro Encarregado, vimos por meio deste informar que a mensalidade referente ao mes de ${currentMonth} esta a dois dias do seu prazo. Faca ja o seu pagamento. Evite multas. Obrigado. `);
            //await sendNotification('258' + carier.contact, stringfyedMessage, conf.smsSenderID);

            await Payment.update(
                { sentNotifications: 2, updatedBy: 1 },
                { where: { id: payment.id } },
                { fields: ['sentNotifications', 'updatedBy'] },
              
            )

            console.log('Segunda notificacao enviada para o numero ' + carier.contact)

        }


        //  4. Buscar todos os pagamentos cuja a data actual e maior que a data limite de Pagamnto e que ainda nao tenham multa e aplicar a multa
        let today2 = new Date();
        let afterLimit=moment([today2.getFullYear(), today2.getMonth(), today2.getDate()]);
        console.log(afterLimit.utc().format("YYYY-MM-DD"))
        let payments3 = await Payment.findAll({ where: { limitDate: afterLimit.utc().format("YYYY-MM-DD"), sucursalId: conf.sucursalId, hasFine: false } });
        console.log(`Encontrou ${payments3.length} pagamentos atrasados na sucural ${conf.sucursalId}`);
        for (let index = 0; index < payments3.length; index++) {
            const payment = payments3[index];
            //2. Para cada Pagamento enviar a segunda notificacao de Pagamento (depois sinalizar o pagamento como sendo notificado )
            carier = await Carier.findOne({
                where: { studentId: payment.studentId }
            });

            //Aplicar a Multa 
            let fine = payment.total * 0.05;
            let newTotal = payment.total + fine;
            await Payment.update(
                { fine, total: newTotal, hasFine: true, updatedBy: 1 },
                { where: { id: payment.id } },
                { fields: ['total', 'fine', 'hasFine', 'updatedBy'] },
               
            )

            console.log('Multa aplicada para o pagamento: ', payment.id);

        }

    }// Fim da iteracao de configuracoes de sucursais
    console.log('Fim da execução da task de multa e notificações');


});
//Inicia a execução da task
task.start();

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

    var req = https.request(options, function (res) {
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