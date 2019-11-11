/*
*
*/
const path          = require('path')        ;
const dbClass       = require( path.join(__dirname,'../server/db/dbIndex') ).bases ;
const utiles        = require( path.join(__dirname,'../server/lib/utiles') ).Utilitarios() ;
const mercadolibre  = require( path.join(__dirname,'../server/mercadolibreSincronizacion/mercadolibreIndex') ).mercadolibre ;
//
const configuracionApp   = utiles.parseArchivoJson2Js( path.join(__dirname,'../server/config/general.json') ) ;
//
console.dir(configuracionApp) ;
const db                = dbClass( configuracionApp.database[process.env.AMBIENTE||'dev'] ) ;
const mercadolibreDatos = mercadolibre(configuracionApp) ;
mercadolibreDatos.products.iniciarSincronizacionSellerId( configuracionApp.mercadolibre.sellerId )
        .then(respSincro=>{
            //console.dir(respSincro) ;
            let arrayProds = Object.values(respSincro) ;
            return db.productos.add(arrayProds ) ;
        })
        .then(respDb=>{
            console.log('....despues de ADD.::l: '+respDb.lenght) ;
            console.log('.....fin') ;
        })
        .catch(respErr=>{
            console.dir(respErr) ;
        }) ;
//