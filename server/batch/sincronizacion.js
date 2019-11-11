/*
*
*/
const path          = require('path')        ;
const cron          = require('node-cron')   ;
const fnEmail       = require( path.join( __dirname,'../lib/emailEnviar') ).email ;
const mercadolibre  = require( path.join( __dirname,'../mercadolibreSincronizacion/mercadolibreIndex') ).mercadolibre ;
//
const generaReporteProductosSincronizados = (argProdSincro) => {
    let outReporte = {total:0,reporte:''} ;
    try {
        let arrayProductos = Array.isArray(argProdSincro) ? argProdSincro : Object.values(argProdSincro) ;
        for(let posPr=0;posPr<arrayProductos.length;posPr++){
            let objProducto = arrayProductos[posPr] ;
            outReporte.reporte += "<br/>id: "+(objProducto.id||objProducto._id)+" Precio: "+objProducto.precio+" Titulo: "+objProducto.nombre+" stock: "+(objProducto.stock||0) ;
        }
        outReporte.total = arrayProductos.length || 0 ;
    } catch(errRepo){ throw errRepo; }
    return outReporte ;
} ;
//
module.exports.sincronizacion = (argConfig,argDb) => {
    let muestraAmbiente = (process.env.AMBIENTE && process.env.AMBIENTE=='produccion') ? '' : 'TEST - ' ;
    const sendGmail     = fnEmail( argConfig, argConfig.email.emailSoporte ) ;
    //
    const sincronizarMercadolibre = () => {
        return new Promise(function(respOk,respRech){
            try {
                //
                console.log('.....flag sincro: '+argConfig.mercadolibre.sincronizacion.activado+' Sincronizacion de productos desde mercadolibre...') ;
                let flagSincronizacion  = argConfig.mercadolibre.sincronizacion.activado=='true' ? true : false ;
                if ( flagSincronizacion==true ){
                    const mercadolibreDatos = mercadolibre(argConfig) ;
                    console.log('....schedule:: '+argConfig.mercadolibre.sincronizacion.crosSchedule) ;
                    cron.schedule(argConfig.mercadolibre.sincronizacion.crosSchedule, function(){
                        console.log(new Date().toISOString()+'....llego la hora de sincronizar.') ;
                        let tempTsSincro = new Date().toISOString() ;
                        mercadolibreDatos.products.iniciarSincronizacionSellerId( argConfig.mercadolibre.sellerId, tempTsSincro )
                            .then(function(respSincro){
                                return argDb.productos.add( Object.values(respSincro) ) ;
                            }.bind(this))
                            .then(function(respDb){
                                return generaReporteProductosSincronizados( respDb ) ;
                            }.bind(this))
                            .then(function(reporteSincro){
                                console.log(new Date().toISOString()+'.......se sincronizaron: '+reporteSincro.total+' productos.') ;
                                sendGmail({
                                    subject: muestraAmbiente+' Sincronizacion productos mercadolibre: ' ,
                                    html: '<p style="font-weight:bold;">Sincronización finalizada</p><br/>'
                                          +'<p style="font-weight:bold;">Cantidad de productos:'
                                          + reporteSincro.total+'</p><br/>'
                                          +'<pre style="font-size:18px;font-family:\""Courier New", Courier, monospace;\" ">'+reporteSincro.reporte+'</pre>'
                                },
                                function (err, res) { if ( err ){console.log('....ERROR enviando email: ') ;console.dir(err); } }) ;
                                return {} ;
                            }.bind(this))
                            .then(function(respSincro222){
                                return argDb.productos.get( {ts_sincronizacion:{"$ne":tempTsSincro}} ) ;
                            }.bind(this))
                            .then(function(prodNoActivos){
                                for(let keyNo in prodNoActivos ){
                                    prodNoActivos[keyNo].estadoProducto = 'NO_ACTIVO' ;
                                }
                                return argDb.productos.add( Object.values(prodNoActivos) ) ;
                            }.bind(this))
                            .then(function(prodFF){
                                console.log('....termine con todo') ;
                            }.bind(this))
                            .catch(respErr   => {
                                console.dir(respErr) ;
                                sendGmail({
                                    subject: muestraAmbiente+' Sincronizacion productos mercadolibre: **** ERROR *****' ,
                                    html: '<p>ERROR sincronizando productos de mercadolibre: <br/><br/>\n'+respErr+'</p>'
                                },
                                function (err, res) { if ( err ){console.log('....ERROR enviando email: ') ;console.dir(err); } }) ;
                            }) ;
                    }.bind(this)) ;
                }
            } catch(errSinMl){ respRech(errSinMl); }
        }.bind(this)) ;
    }
    //
    return {
        mercadolibre: sincronizarMercadolibre
    }
    //
}
//