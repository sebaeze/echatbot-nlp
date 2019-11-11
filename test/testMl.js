/*
*
*/
const path    = require('path') ;
const ml      = require( path.join( __dirname,'../server/mercadolibre/api') ).apiMercadolibre() ;
/*
*
*/
ml.actualizaProductosMl();
//