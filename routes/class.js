const express=require('express');
const Class=require('../models/class');
const router=express.Router();
 
//Cria Membro
router.post('/', async (req,res)=>{
    const {level,sucursalId,createdBy,activatedBy}=req.body; 
    Class.create({level,sucursalId,createdBy,activatedBy}).then(function(worker) {
        res.send(worker);
      })
});

//Actualiza Obreiro
router.put('/:id', async (req,res)=>{
  const {level,sucursalId,updatedBy}=req.body;  
  Class.update(
      {level,sucursalId,updatedBy},
      {fields: ['level','sucursalId','updatedBy']},
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
  Class.update(
        { active:false,activationdate:Date.now(),activatedBy},
        {fields: ['active','activationDate',]},
        { where: { id:req.params.id} }
      )
        .then(result =>
            res.send(result)
        )
        .catch(err =>
          console.log(err)
        )    
});


router.get('/:sucursalId/:page', async (req,res)=>{
    var page=req.params.page;
 Class.findAll({where:{ sucursalId:req.params.sucursalId},offset: (6*page)-6, limit: 6,order: 'createdAt DESC' }).then(function(classes) {
        res.send(classes);
      });   
});

router.get('/:sucursalId', async (req,res)=>{
Class.findAll({where:{ sucursalId:req.params.sucursalId},order: 'createdAt DESC' }).then(function(classes) {
      res.send(classes);
    });   
});

//Busca total
router.get('/count/all/classes/:sucursalId', async (req,res)=>{   
  Class.count({where:{ sucursalId:req.params.sucursalId}})
.then(function(total) {
  res.status(200).json({
    total: total
  });
});
});

module.exports=router;