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
const registration = require('./routes/registration');
const frequency = require('./routes/frequency');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
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
app.use('/api/frequency', frequency);

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
  res.render('error');
});


 app.listen(process.env.PORT, '127.0.0.1',() => {
  console.log(`server running on port ${process.env.PORT}`);

}
) 
