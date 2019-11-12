/*
*
*/
const express          = require('express');
const app              = express();
const bodyParser       = require('body-parser') ;
const cookieParser     = require('cookie-parser')   ;
const session          = require('express-session') ;
const MemoryStore      = require('session-memory-store')(session);
const dbClass          = require('./db/dbIndex').bases ;
//
import configuracionApp   from './config/general.json' ;
console.dir(configuracionApp) ;
//
if ( !process.env.AMBIENTE ){ process.env.AMBIENTE="dev"; }
//
let configDb = configuracionApp.database[process.env.AMBIENTE ||'dev'] ;
const db               = dbClass( configDb ) ;
//
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
//app.use(serveFavicon(path.join(__dirname,'../dist/img/favicon.ico'))) ;
app.use(cookieParser()) ;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({ name:'mlsess',secret: 'wsx22wsx',cookie: {path: '/',httpOnly: true,maxAge: 6000000 },proxy: true, resave: true,saveUninitialized: true, store: new MemoryStore() }));
//
const puerto          = process.env.PUERTO_WIDGET || 3001  ;
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