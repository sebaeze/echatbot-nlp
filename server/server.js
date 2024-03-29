/*
*
*/
const express          = require('express');
const app              = express();
const fs               = require('fs')   ;
const path             = require('path') ;
const https            = require('https') ;
const bodyParser       = require('body-parser') ;
const cookieParser     = require('cookie-parser')   ;
const session          = require('express-session') ;
const MongoStore       = require('connect-mongo')(session);
//
//const dbClass          = require('./db/dbIndex').bases ;
import { bases as dbClass }   from '@sebaeze/echatbot-mongodb' ;
import configuracionApp       from './config/general.json' ;
//
if ( !process.env.AMBIENTE ){ process.env.AMBIENTE="dev"; }
process.env.AMBIENTE      = String(process.env.AMBIENTE).trim() ;
//
let configDb = configuracionApp.database[process.env.AMBIENTE ||'dev'] ;
const db               = dbClass( configDb ) ;
//
//app.use(serveFavicon(path.join(__dirname,'../dist/img/favicon.ico'))) ;
app.use(cookieParser()) ;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//
app.use(session({
  name:'ckwaibocwidget',secret: 'wsx22wsx',cookie: {path: '/',httpOnly: true,maxAge: (2 * 24 * 60 * 60 * 1000) },proxy: true, resave: true,saveUninitialized: true,
  store: new MongoStore({
    mongooseConnection: db.chatbot.getConeccion().connection,
    collection:'sessionswidget'
  })
}));
//
const puerto          = process.env.PUERTO_WIDGET ? String(process.env.PUERTO_WIDGET).trim() : 3001  ;
const routerIndex     = require( './routes/routerIndex' )     ;
const routerChatbot   = require( './routes/routerChatbot' )   ;
const routerErrores   = require( './routes/routerErrores'   ) ;
//
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', '*');
  res.header("Access-Control-Allow-Credentials", true);
  next() ;
})
app.disable('x-powered-by');
app.disable('etag');
//
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//
app.enable('trust proxy');
//
/*
if ( process.env.AMBIENTE=='produccion' ){
  app.use(require('express-naked-redirect')({
    subDomain: 'www',
    protocol: 'https'
  })) ;
}
*/
//
/*
*   Rutas
*/
//
try {
    //
    app.all('*', function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', '*');
      res.header("Access-Control-Allow-Credentials", true);
      res.header("credentials","same-origin") ;
      next() ;
    }) ;
    //
    app.use('/'        , routerIndex(  {...configuracionApp},db) ) ;
    app.use('/chatbot' , routerChatbot({...configuracionApp},db) ) ;
    //
    /*
    app.listen(puerto,function(){
      console.log('....listen server on http://localhost:'+puerto) ;
    }) ;
    */
    //
    if ( process.env.AMBIENTE=='produccion' ){
      var privateKey  = fs.readFileSync( path.join(__dirname,'./cert/waiboc.com.privkey.pem') );
      var certificate = fs.readFileSync( path.join(__dirname,'./cert/waiboc.com.cert.pem') );
      console.log('....voy a iniciar en puerto: '+puerto+';')
      https.createServer({
          key: privateKey,
          cert: certificate
      }, app).listen(puerto,function(){
        console.log('....listen server on https://www.waiboc.com:'+puerto) ;
      });
    } else {
      app.listen(puerto,function(){
        console.log('....listen server on http://localhost:'+puerto) ;
      }) ;
    } ;
    //
    //
  } catch( errApplaunch ){
    console.dir(errApplaunch) ;
  }
//