const express = require('express');
const user = require('./routes/user');
const worker = require('./routes/worker');
const auth = require('./routes/auth');
const Student = require('./models/student');
const student = require('./routes/student');
const carier = require('./routes/carier');
const profile = require('./routes/profile');
const payment = require('./routes/payment');
const sucursal = require('./routes/sucursal');
const path = require('path');
const registration = require('./routes/registration');
const frequency = require('./routes/frequency');
const smsntification = require('./routes/api/smsnotification');
const task = require('./routes/api/task');
const sincronizeData = require('./routes/api/syncronize');
const logininfo = require('./routes/logininfo');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const cors = require('cors');
var router = express.Router();
const app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

router.post('/', async (req,res)=>{
console.log(req.body.sucursal);

await sincronizeData(io,req.body.sucursal);


});

router.get('/count/:sucursalId', async (req,res)=>{
  const amount = await Student.count({
  where:{ sucursalId:req.params.sucursalId,syncStatus:{
  [Op.in]: [0,1]
  }}
  });
  res.json({ amount});
  });


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.json());
app.use('/api/user', user);
app.use('/api/auth', auth);
app.use('/api/worker', worker);
app.use('/api/student', student);
app.use('/api/carier',carier);
app.use('/api/profile', profile);
app.use('/api/payment', payment);
app.use('/api/sucursal', sucursal);
app.use('/api/registration', registration);
app.use('/api/smsntification', smsntification);
app.use('/api/frequency', frequency);
app.use('/api/logininfo', logininfo);
app.use('/api/task', task);
app.use('/api/sincronize', router);

app.use('/public/files', express.static(__dirname + '/public/files'));
app.use(express.static(__dirname + '/public'));

//Configuando o ficheiro das variáveis de ambiente. A ser removido futuramente
dotenv.config();

app.use(logger('dev'));
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);

app.use(
  bodyParser.json()
);
app.use(cookieParser());

//Upload pictures
app.post('/api/upload/pictures', (req, res, next) => {  

  //Escrevendo o conteudo em pequenos chunks
 var bufferStream = new stream.PassThrough();
 bufferStream.end(new Buffer(req.files.file.data));
 bufferStream.pipe(
   bucket.file(req.files.file.name).createWriteStream({
     resumable: false,
     metadata:{
       contentType: req.files.file.mimetype
     },    
     gzip: true
   })
 )
 .on("finish",  () => {
   console.log('Upload para o google cloud  Feito com sucesso');
   res.json({ file:  req.files.file.name});
 })

});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err)
 
});

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});




app.get('/api/syncronize/count/:sucursalId', async (req,res)=>{
  const amount = await Student.count({
  where:{ sucursalId:req.params.sucursalId,syncStatus:{
  [Op.in]: [0,1]
  }}
  });
  res.json({ amount});
  });

server.listen(3333, '127.0.0.1',() => {
  console.log(`server running on port ${3333}`);

}
) ;



