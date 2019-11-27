/*
*
*/
const path               = require('path')        ;
//const dbClass            = require( path.join(__dirname,'../server/db/dbIndex') ).bases ;
import { bases as dbClass }   from 'echatbot-mongodb' ;
console.dir(dbClass) ;
//
const utiles        = require( path.join(__dirname,'../server/lib/utiles') ).Utilitarios() ;
const configuracionApp   = utiles.parseArchivoJson2Js( path.join(__dirname,'../server/config/general.json') ) ;
//
console.dir(configuracionApp) ;
const db                = dbClass( configuracionApp.database['dev'] ) ;
// const db                = dbClass( configuracionApp.database[process.env.AMBIENTE||'produccion'] ) ;
//
let newMsg = {
    userMessage: 'hola',
    answer: ' qque queres ?? '
}
//
db.conversacion.qry( {} )
        .then(respDDd=>{
            console.log('....respuesta del ADD:: ') ;
            console.dir(respDDd) ;
        })
        .catch(respErr=>{
            console.dir(respErr) ;
        }) ;
//