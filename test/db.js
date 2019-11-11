/*
*
*/
const path               = require('path')        ;
const dbClass            = require( path.join(__dirname,'../server/db/dbIndex') ).bases ;
//const dbProdCL           = require( path.join(__dirname,'../server/db/db') ).classDb ;
const utiles        = require( path.join(__dirname,'../server/lib/utiles') ).Utilitarios() ;
const configuracionApp   = utiles.parseArchivoJson2Js( path.join(__dirname,'../server/config/general.json') ) ;
//
//console.dir(configuracionApp) ;
const db                = dbClass( configuracionApp.database[process.env.AMBIENTE||'dev'] ) ;
/*
const dbPadre             = new dbProdCL( configuracionApp.database[process.env.AMBIENTE||'dev'] ) ;
const dbHija              = new dbProdCL( dbPadre ) ;
*/
//
//db.productos.add( {_id:'test',nombre:'nombreTest',marca:'marcaFruta',tipo:'tipoTest',modelo:'modeloTest',precio: 100.00 } )
//db.usuarios.add( {_id:'sebaaa@gmail.com',email:'sebaaa@gmail.com'} )
db.productos.getMarcasCategoriasCantidades( {email:'sebaaa@gmail.com'} )
        .then(respSincro=>{
            console.log('....termin categorias') ;
            console.dir(respSincro) ;
        })
        .catch(respErr=>{
            console.log('.....error: ')
            console.dir(respErr) ;
        }) ;
        console.log('...fin') ;
//
/*
db.productos.getCategoriasCantidad()
        .then(respSincro=>{
            console.dir(respSincro) ;
        })
        .catch(respErr=>{
            console.dir(respErr) ;
        }) ;
        */