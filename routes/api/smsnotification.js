var fs = require('fs');
const express = require('express');
const router = express.Router();
const cron = require('node-cron');
const Configuration = require('../../models/paymentconfig');
const Payment = require('../../models/payment');
var moment = require('moment');
const Carier = require('../../models/carier');
var http = require("https");
const keys = require('./../../config/keys');

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
            console.log('O dia de inicio eh igual a hoje');
            let payments = await Payment.findAll({ where: { month: today.getMonth()+1, year: today.getFullYear(), sucursalId: conf.sucursalId, sentNotifications: 0 } });
            console.log(`Encontrou ${payments.length} pagamentos para o mês de ${today.getMonth()+1} do ano de ${today.getFullYear()} na sucural ${conf.sucursalId}`);
            for (let index = 0; index < payments.length; index++) {
                const payment = payments[index];
                //2. Para cada Pagamento enviar a primeira notificacao de Pagamento (depois sinalizar o pagamento como sendo notificado )
                carier = await Carier.findOne({
                    where: { studentId: payment.studentId }
                });

                console.log('Enviando notificação para ' + carier.contact)
                let currentMonth=months[payment.month-1];
                let nextMonth=months[payment.month];
                let endDay=conf.paymentEndDay;
                 await sendNotification('258' + carier.contact, `Caro%20Encarregado%2C%20vimos%20por%20meio%20deste%20informar%20que%20o%20pagamento%20da%20mensalidade%20referente%20ao%20mes%20de%20${currentMonth}%2C%20j%C3%A1%20est%C3%A1%20em%20cobran%C3%A7a%20a%20partir%20de%20hoje%20at%C3%A9%20o%20dia%20${endDay}%20de%20${nextMonth}.%20Fa%C3%A7a%20j%C3%A1%20o%20seu%20Pagamento.%20Evite%20Multas.%20%20Obrigado`, conf.smsSenderID);

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
          
        let payments2 = await Payment.findAll({ where: { limitDate: limitDate.utc().format("YYYY-MM-DD"), sucursalId: conf.sucursalId, sentNotifications: 1 } });
        console.log(`Encontrou ${payments2.length} pagamentos que estao a dois dias do limite na sucural ${conf.sucursalId}`);
        for (let index = 0; index < payments2.length; index++) {
            const payment = payments2[index];
            //2. Para cada Pagamento enviar a segunda notificacao de Pagamento (depois sinalizar o pagamento como sendo notificado )
            carier = await Carier.findOne({
                where: { studentId: payment.studentId }
            });

            console.log('Enviando notificação para ' + carier.contact)
            await sendNotification('258' + carier.contact, `Caro%20Encarregado%2C%20vimos%20por%20meio%20deste%20informar%20que%20o%20pagamento%20da%20mensalidade%20referente%20ao%20mes%20de%20${currentMonth}%2C%20est%C3%A1%20a%20dois%20dias%20do%20prazo.%20Fa%C3%A7a%20j%C3%A1%20o%20seu%20Pagamento.%20Evite%20Multas.%20%20Obrigado`, conf.smsSenderID);

            await Payment.update(
                { sentNotifications: 2, updatedBy: 1 },
                { where: { id: payment.id } },
                { fields: ['sentNotifications', 'updatedBy'] },
              
            )

            console.log('Segunda notificacao enviada para o numero ' + carier.contact)

        }


        //  4. Buscar todos os pagamentos cuja a data actual e maior que a data limite de Pagamnto e que ainda nao tenham multa e aplicar a multa
        let afterLimit=moment([today.getFullYear(), today.getMonth(), today.getDate()+1]);
        let payments3 = await Payment.findAll({ where: { limitDate: { $lt: afterLimit.utc().format("YYYY-MM-DD") }, sucursalId: conf.sucursalId, hasFine: false } });
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