/*
*
*/
const moment      = require('moment-timezone')     ;
class Db  {
    //
    constructor(argConfigDb){
        //
        this.utilMongo  = require('./util/utilMongo') ;
        //
        if ( argConfigDb instanceof Db ){
            this.coneccion     = argConfigDb.getConeccion() ;
            this.configuracion = argConfigDb.getConfiguracion() ;
        } else {
            if ( !argConfigDb.url      ){ argConfigDb.url='mongodb://localhost:27017'; }
            if ( !argConfigDb.database ){ argConfigDb.database='dburl'; }
            this.configuracion = argConfigDb ;
            this.dbName     = argConfigDb.database || 'mlestadisticas' ;
            this.urlConnect = argConfigDb.url ;
            this.coneccion  = require('mongoose') ;
            //
            console.log('....mongo_url_connect: '+this.urlConnect+'/'+this.dbName+'?authSource=admin'+';');
            this.coneccion.connect( this.urlConnect+'/'+this.dbName+'?authSource=admin' ,{ useNewUrlParser: true } ) ;
            this.coneccion.Promise = global.Promise;
            //
            var db = this.coneccion.connection;
            db.on('error', console.error.bind(console, 'MongoDB connection error:'));
            //
            db.on('connecting', function(){
                console.log("trying to establish a connection to mongo");
            });
            //
            db.on('connected', () => {
                console.log('connected to mongodb');
            });
            //
            db.on('disconnected', () => {
                console.log('connection disconnected');
            })
            //
            db.on('open', function() {
                console.log("database is ready now");
            });
            //
        }
    }
    //
    getConeccion(){
        return this.coneccion ;
    }
    getConfiguracion(){
        return this.configuracion ;
    }
    //
    cerrarConeccion(){
        return new Promise(function(respConn,respRej){
            try {
                if ( this.coneccion ){
                    this.coneccion.cerrar(function(errClose){
                        if ( errClose ){
                            console.log('.....ERROR: cerrando coneccion: ') ;
                            console.dir(errClose) ;
                        }
                        respConn() ;
                        this.coneccion = null ;
                    }.bind(this)) ;
                } else {
                    console.log('.....coneccion no existia') ;
                    respConn() ;
                }
            } catch(errClose){
                respRej(errClose) ;
            }
        }.bind(this)) ;
    }
    //
    conectarBase(argDB){
        return new Promise(function(respClien,respRech){
            try {
                //
                if ( this.coneccion ){
                    respClien( this.coneccion ) ;
                } else {
                    //
                    this.coneccion.connect( this.urlConnect ,{ useNewUrlParser: true } ) ;
                    //
                    /*
                    this.cliente.connect(function(err, client) {
                        if ( err ){
                            console.log('....ERROR connect base: '+argDB+';') ;
                            console.dir(err) ;
                            respRech(err) ;
                        } else {
                            const db       = client.db( this.dbName );
                            db.cerrar      = client.close ;
                            client.cerrar  = client.close ;
                            this.coneccion = db ;
                            respClien(db) ;
                        }
                    }.bind(this)) ;
                    */
                }
                //
            } catch(errConn){
                respRech(errConn) ;
            }
        }.bind(this)) ;
    }
    //
    promiseFind(argColl,argFindSelector){
        return new Promise(function(respData,respRej){
            try {
                this.coneccion.collection( argColl ).find(argFindSelector).toArray(function(argErr,argDatos){
                    if ( argErr ){
                        console.dir(argErr) ;
                        console.log('....ERROR: Durante find: ') ;
                        respRej(argErr) ;
                    } else {
                        respData(argDatos) ;
                    }
                }) ;
            } catch( errFind ){
                respRej(errFind) ;
            }
        }.bind(this)) ;
    }
    //
    promiseFindSortLimit(argColl,argFindSelector){
        return new Promise(function(respPromise,respRej){
            try {
                let tempLimite   = 50 ; // Maximo 50 de lo que sea
                let tempSort     = {} ;
                let tempCampos   = {} ;
                let tempSelector = argFindSelector.query ? argFindSelector.query : {...argFindSelector} ;
                if ( tempSelector.limite ){
                    tempLimite = parseInt(tempSelector.limite) ;
                    delete tempSelector.limite ;
                }
                if ( tempSelector.sort ){
                    if ( typeof tempSelector.sort=="string" ){ tempSelector.sort=tempSelector.sort.split(','); }
                    tempSelector.sort.forEach( elemCampo =>{ tempSort[elemCampo] = -1 ; }) ;
                    delete tempSelector.sort ;
                } else {
                    tempSort     = {_id:-1} ;
                }
                if ( tempSelector.campos ){
                    if ( typeof tempSelector.campos=="string" ){ tempSelector.campos=tempSelector.campos.split(','); }
                    tempSelector.campos.forEach( elemCampo =>{ tempCampos[elemCampo] = 1 ; }) ;
                    delete tempSelector.campos ;
                }
                //
                return argColl.find( tempSelector, Object.keys(tempCampos), {lean: true} )
                              .sort( tempSort )
                              .limit( tempLimite )
                              .exec(function(argErr,argDatos){
                    if ( argErr ){
                        console.dir(argErr) ;
                        console.log('....ERROR: Durante findSortLimit: ') ;
                        respRej(argErr) ;
                    } else {
                        respPromise(argDatos) ;
                    }
                }.bind(this)) ;
                //
                /*
                this.coneccion.collection( argColl )
                              .find( tempSelector, {projection:tempCampos}  )
                              .sort( tempSort )
                              .limit( tempLimite )
                              .toArray(function(argErr,argDatos){
                    if ( argErr ){
                        console.dir(argErr) ;
                        console.log('....ERROR: Durante findSortLimit: ') ;
                        respRej(argErr) ;
                    } else {
                        respPromise(argDatos) ;
                    }
                }.bind(this)) ;
                */
                //
            } catch( errFind ){
                respRej(errFind) ;
            }
        }.bind(this)) ;
    }
    //
    fechaPais(){
        /*
        let tempDate       = new Date() ;
        let tempDiferencia = tempDate.getTimezoneOffset() * 60000 ;
        let outFechaPais   = new Date( tempDate.getTime()-(tempDate.getTimezoneOffset() * 60000) ).toISOString() ;
        */
        let tempM = moment( new Date() ) ;
        tempM.tz("America/Argentina/Buenos_Aires") ;
        //
        return tempM.format() ;
    }
    //
}
//
module.exports.classDb    = Db ;
//