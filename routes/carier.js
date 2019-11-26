const express=require('express');
const Carier=require('../models/carier');
const router=express.Router();
 
//Cria Membro
router.post('/', async (req,res)=>{
    const {name,kinshipDegree,principal,contact,docType,docNumber,workPlace,studentId,createdBy,activatedBy}=req.body; 
    Carier.create({name,kinshipDegree,principal,contact,docType,docNumber,workPlace,studentId,createdBy,activatedBy}
      ).then(function(carier) {
        res.send(carier);
      })
});

//Actualiza Obreiro
router.put('/:id', async (req,res)=>{
  const {name,kinshipDegree,principal,contact,docType,docNumber,workPlace,studentId,updatedBy}=req.body;  
  Carier.update(
      {name,kinshipDegree,principal,contact,docType,docNumber,workPlace,studentId,updatedBy},      
       {fields: ['name','kinshipDegree','principal','contact','docType','docNumber','workPlace','studentId','updatedBy']},
      { where: { id:req.params.id} }
    )
      .then(result =>
          res.send(result)
      )
      .catch(err =>
        console.log(err)
      )    
});

//Actualiza Obreiro
router.put('/inativate/:id', async (req,res)=>{
  Carier.update(
        { active:false,activationDate:Date.now(),activatedBy},
        {fields: ['active','activationDate','activatedBy']},
        { where: { id:req.params.id} }
      )
        .then(result =>
            res.send(result)
        )
        .catch(err =>
          console.log(err)
        )    
});

//Busca Todos os Membros
router.get('/:page', async (req,res)=>{
    var page=req.params.page;
 Carier.findAll({offset: (6*page)-6, limit: 6,order: 'createdAt DESC' }).then(function(cariers) {
        res.send(cariers);
      });   
});

//Busca Todos os Membros
router.get('/', async (req,res)=>{
Carier.findAll({order: 'createdAt DESC' }).then(function(cariers) {
      res.send(cariers);
    });   
});

//Busca total
router.get('/count/all/cariers', async (req,res)=>{   
  Carier.count()
.then(function(total) {
  res.status(200).json({
    total: total
  });
});
});

module.exports=router;