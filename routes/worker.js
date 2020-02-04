const express=require('express');
const Worker=require('../models/worker');
const router=express.Router();
 
//Cria Membro
router.post('/', async (req,res)=>{
    const {birthdate, picture, name,email,contact,category,address,isuser,createdBy,activatedBy}=req.body; 
    Worker.create({ birthdate, picture, name,email,contact,category,address,isuser,createdBy,activatedBy}).then(function(worker) {
        res.send(worker);
      })
});

//Actualiza Obreiro
router.put('/:id', async (req,res)=>{
    const {birthdate, picture, name,email,contact,category,address,isuser,updatedBy}=req.body;  
    User.update(
        { birthdate, picture, name,email,contact,category,address,isuser,updatedBy},
        {fields: ['birthdate','picture','name','email','contact','category','address','isuser','updatedBy']},
        { where: { id:req.params.id} }
      )
        .then(result =>
            res.send(result)
        )
        .catch(err =>
          console.log(err)
        )    
});


router.get('/:page', async (req,res)=>{
    var page=req.params.page;
 Worker.findAll({offset: (6*page)-6, limit: 6,order: 'creationdate DESC' }).then(function(workers) {
        res.send(workers);
      });   
});

router.get('/unique/:id', async (req,res)=>{
   Worker.findOne({  where: { id:req.params.id}}).then(function(workers) {
    res.send(workers);
  });
  
});

router.get('/count/alll/workers', async (req,res)=>{   
  Worker.count()
.then(function(total) {
  res.status(200).json({
    total: total
  });
});
  
});

//Busca por sucursal
router.get('/sucursal/:sucursalId/:page', async (req,res)=>{
  var page=req.params.page;
Worker.findAll({where:{ sucursalId:req.params.sucursalId},offset: (6*page)-6, limit: 6,order: 'creationdate DESC' }).then(function(workers) {
      res.send(workers);
    });   
});

router.get('/unique/:id', async (req,res)=>{
 Worker.findOne({  where: { id:req.params.id}}).then(function(workers) {
  res.send(workers);
});

});

router.get('/sucursal/:sucursalId/count/alll/workers', async (req,res)=>{   
Worker.count({where:{ sucursalId:req.params.sucursalId}})
.then(function(total) {
res.status(200).json({
  total: total
});
});

});

module.exports=router;