/*
*
*/
const path   = require('path') ;
//const urlMdb = {url: 'mongodb://sebaeze:ZXCasdqwe123@66.97.35.197:27017/admin',poolSize: 10, ssl: true} ;
const urlMdb = {url: 'mongodb://root:!ZXCasdqwe123@66.97.35.197:27017/admin',poolSize: 10, ssl: true} ;
const dbApi  = require( path.join(__dirname,'../server/mercadolibre/db/dbApi') ).databaseApiInstance( urlMdb ) ;
//
console.dir(urlMdb) ;
dbApi.addUrl()
    .then(function(respDD){
        console.dir(respDD) ;
    })
    .catch(function(errDD){
        console.dir(errDD) ;
    }) ;
//