const config = require('config');
const express = require('express');
var fs = require('fs');
const user = require('./routes/user');
const worker = require('./routes/worker');
const auth = require('./routes/auth');
const student = require('./routes/student');
const carier = require('./routes/carier');
const profile = require('./routes/profile');
const payment = require('./routes/payment');
const sucursal = require('./routes/sucursal');
const path = require('path');
const registration = require('./routes/registration');
const frequency = require('./routes/frequency');
const smsntification = require('./routes/api/smsnotification');
const Sucursal=require('./models/sucursal');
const Student=require('./models/student');
const Registration=require('./models/registration');
const Payment=require('./models/payment');
const Carier=require('./models/carier');
const Frequency=require('./models/frequency');
const User=require('./models/user');
const Worker=require('./models/worker');
//const task = require('./routes/api/task');
const logininfo = require('./routes/logininfo');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const cron = require('node-cron');
const app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
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

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

var task1 = cron.schedule('*/1 * * * *', async () => {
  console.log('Sincronizando Dados');

//Verificar se o servidor remoto esta connectado, enviando uma mensagem de verificao
//Caso esteja conectado, iniciar a syncronizacao.
let configurations = await Configuration.findAll({
  raw: true, order: [
      ['id', 'ASC']
  ],
})

for (let index = 0; index < configurations.length; index++) {





}




});

//Inicia a execução da task
task1.start();




io.on('connection', function(socket) {
  console.log('Client connected...');
  socket.on('FromAPI', data => console.log(data));
  socket.emit("update", 'Message from the Server');
  socket.on('disconnect', () => {
    console.log("Client disconnected");
  });
});
server.listen(3333);

