const Student=require('../../models/student');
const Registration=require('../../models/registration');
const Payment=require('../../models/payment');
const Carier=require('../../models/carier');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const express = require('express');
const app = express();
app.use('/public/files', express.static(__dirname + '/public/files'));
const axios = require('axios').default;
const api = axios.create({
  baseURL: 'https://sistemadeensino.com/',
  timeout: 60000
});

const sincronizeData=async (socket,sucursal)=>{
  socket.emit("syncing",'A sincronizar');
      var processed=0;
        await Student.findAll({raw: true,where:{ sucursalId:sucursal.id,syncStatus:{
          [Op.in]: [0,1]
            }} , order: [
          ['syncStatus', 'ASC'],['createdAt', 'DESC'],
        ], }).then( async function(students) {
      
      console.log('Encontrados '+students.length+' estudantes novos por sincronizar');

       for (let i = 0; i < students.length; i++) {
          processed++;
          const student = students[i];
        let registrations=await Registration.findAll({ raw: true,where:{studentId:student.id}, order: [
          ['createdAt', 'DESC'],
      ], });
      
      let carier=await Carier.findOne({where:{studentId:student.id}});
      console.log('A sincronizar o estudante ',student.name);
      console.log('Encontradas '+registrations.length+' inscricoes por sincronizar');
      console.log('A sincronizar encarregado ',carier.name);
      
          if(student.syncStatus==0){
            try {
      
      //Registando os dados no servidor remoto
      let s= await api.post("/api/student/client", {
        name:student.name,address:student.address,
        sex:student.sex,picture:student.picture,
        level:student.level,
        birthDate:student.birthDate,docType:student.docType,
        studentNumber:student.studentNumber,
        currentMonthlyPayment:student.currentMonthlyPayment,
        studentAddress:student.studentAddress,level:student.level,
        docNumber:student.docNumber,alergicToFood:student.alergicToFood,
        alergicToMedicine:student.alergicToMedicine,motherContact:student.motherContact,
        fatherContact:student.fatherContact,motherName:student.motherName,
        fatherName:student.fatherName,sucursal,
        createdBy:student.createdBy,activatedBy:student.activatedBy
      })
      .catch(function (error) { 
      //Log the error    
      });
      
      await api.post("/api/carier", {
        name:carier.name,kinshipDegree:carier.kinshipDegree,contact:carier.contact,
        workPlace:carier.workplace,studentId:s.data.id,createdBy:carier.createdBy,activatedBy:carier.activatedBy
      })
      
      .catch(function (error) { 
       //log the error
         
      });
      
      for (let index = 0; index < registrations.length; index++) {
        const registration = registrations[index];
      
        let payments=await Payment.findAll({ raw: true,where:{registrationId:registrations[0].id}, order: [
          ['createdAt', 'ASC'],
        ], });
      
        await api.post("/api/registration/client", {monthlyPayment:registration.monthlyPayment,
          level:student.level,totalPaid:registration.totalPaid,discount:registration.discount,studentId:s.data.id,
          isNew:registration.isNew,year:registration.year,sucursal,classId:registration.classId,
          createdBy:registration.createdBy,activatedBy:registration.activatedBy
        })
      
        .then(async function(reg) {
          for (let j = 0; j < payments.length; j++) {
            const payment = payments[j];
            await api.post("/api/payment", {total:payment.total,discount:payment.discount,sucursal,
             code:payment.code,fine:payment.fine,paymentDate:payment.paymentDate,status:payment.status,hasFine:payment.hasFine, studentId:s.data.id,limitDate:payment.limitDate,year:payment.year,registrationId:reg.data.id,
              createdBy:payment.createdBy,month:payment.month,
              activatedBy:payment.activatedBy
            }).catch(function (error) { 
            
              console.log(error);
              //Log the error
               
            })
          }
      
        })
        .catch(function (error) { 
        //Log the error
           
        });
      
      }
      
      await  Student.update(
        {syncStatus:2,updatedBy:0},
        { where: { id:students[i].id} },
        {fields: ['syncStatus','updatedBy']});
      }
      catch (e) {
        console.log("Erro ao sincronizar dados");
        console.log(e);
      }
      
      
       } //Fim do ciclo de criacao
      
      
       //###################______Actualizacao______________####################
      else{
      try{
       for (let index = 0; index < registrations.length; index++) {
      const registration = registrations[index];
      let payments=await Payment.findAll({ raw: true,where:{registrationId:registration.id}, order: [
       ['createdAt', 'ASC'],
      ], });
      
      //Buscar o estudante no servidor remoto por actualizar
      let remoteStudent=await api.get("/api/student/uniquebystudentNumber/"+student.studentNumber);
      console.log('Estudante Remoto'+student.studentNumber,remoteStudent.data.name)
      
      let remoteCarier=await api.get("/api/carier/studentId/"+remoteStudent.data.id);
      console.log('Encarregado Remoto',remoteCarier.data.name)
      //Buscar o Carier no servidor
      let remoteRegistration=await api.get("/api/registration/studentId/"+remoteStudent.data.id);
       
      console.log('Inscricao Remoto',remoteRegistration.data.id)
      //Buscar o registration no servidor
       await api.put("/api/student/client/"+remoteStudent.data.id, {
         name:student.name,alergicToFood,alergicToMedicine,
         carierId:remoteCarier.data.id,active:student.active,
         registrationId:remoteRegistration.data.id,oldSchool,address:student.address,sex:student.sex,
         birthDate:student.birthDate,docType:student.docType,docNumber:student.docNumber,
         studentNumber:student.studentNumber,carierActive:carier.active,
         motherName:student.motherName,fatherName:student.fatherName,picture:student.picture,
         motherContact:student.motherContact,fatherContact:student.fatherContact,
         totalPaid:registration.totalPaid,registrationActive:registration.active,monthlyPayment:registration.monthlyPayment,payments,
         carierName:carier.name,kinshipDegree:carier.kinshipDegree,contact:carier.contact,carierDocType:carier.docType,
         carierDocNumber:carier.docNumber,workPlace:carier.workPlace,
         discount:registration.discount,isNew:registration.isNew,needSpecialTime:registration.needSpecialTime,
         classId:registration.classId,
         currentMonthlyPayment:registration.currentMonthlyPayment,level:student.level,updatedBy:student.updatedBy
       }).catch(function (error) { 
       
         //Log the error
          
       })
      
      
      }
      }
      catch (e) {
        console.log("Erroao sincronizar dados");
        console.log(e);
      }
      }
      
          console.log('Total: ',students.length);
          console.log('Percentagem: ',(processed*100)/students.length);
          socket.emit("percentage",(processed*100)/students.length);
          console.log('Estudante '+student.name+' sincronizado com sucesso!');
          console.log('Processados: ',processed);
          
       }
      

       socket.emit("finish",'Sincronizacao Finalizada');
        });
   
     // socket.emit('sincronized','Todos os dados foram sincronizados');
      console.log('Todos os dados foram sincronizados com sucesso!');
      console.log('Task processada com sucesso!');

      res.sendStatus(200);


};
    
  module.exports = sincronizeData;