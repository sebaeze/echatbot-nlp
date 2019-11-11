/*
*
*/
const Db                 = require('./db').classDb        ;
const schemaEstadisticas = require('./modelos/schemaEstadisticas') ;
//
class DbEstadisticas extends Db {
    //
    constructor(argConfigDb){
        super(argConfigDb) ;
        this.collectionNombre = 'estadisticas' ;
        this.colleccion       = this.coneccion.model(this.collectionNombre,schemaEstadisticas) ;
    }
    //
    addUrl(argObjUrl){
        return new Promise(function(respData,respRej){
            try {
                //
                this.conectarBase( this.dbName )
                    .then(function(argDb){
                        return argDb ;
                    }.bind(this))
                    .then(function(argDbConn){
                        argDbConn.collection('url').insertOne( argObjUrl, {w: 'majority', wtimeout: 10000, serializeFunctions: true } ,
                        function(err, r) {
                            if ( err ){
                                console.log('codigo: '+err.code+';') ;
                                respRej(err) ;
                            } else {
                                respData( r ) ;
                            }
                            argDbConn.cerrar() ;
                        });
                      //
                    }.bind(this))
                    .catch(respRej) ;
                //
            } catch(errAddUrl){
                respRej(errAddUrl) ;
            }
        }.bind(this))
    }
    //
    addEstadistica(argObjUrl){
        return new Promise(function(respData,respRej){
            try {
                //
                if ( argObjUrl.http ){
                    delete argObjUrl.http.$wscs ;
                    delete argObjUrl.http.$wsis ;
                    delete argObjUrl.http.$wsra ;
                    delete argObjUrl.http.$wssc ;
                    delete argObjUrl.http.$wssn ;
                    delete argObjUrl.http.$wssp ;
                }
                //
                let tempEstadistica = Object.assign(argObjUrl,{ts_ultima_visita:this.fechaPais()})
                tempEstadistica._id = tempEstadistica._id || tempEstadistica.id || tempEstadistica.tipo || false ;
                this.conectarBase( this.dbName )
                    .then(function(argDb){
                        return this.findProducto(tempEstadistica) ;
                    }.bind(this))
                    .then(function(datosFind){
                        if ( !tempEstadistica.visitas ){ tempEstadistica.visitas=[]; }
                        if ( datosFind.length>0 ){
                            datosFind        = datosFind[0] ;
                            tempEstadistica  = Object.assign(tempEstadistica,datosFind) ;
                            if ( !tempEstadistica.cantidadVisitas ){ tempEstadistica.cantidadVisitas=0; }
                            tempEstadistica.ts_ultima_visita = this.fechaPais() ;
                            tempEstadistica.cantidadVisitas++ ;
                            tempEstadistica.visitas.push( {timestamp: this.fechaPais(),
                                                        query: tempEstadistica.http.query || {},
                                                        ipAddres: tempEstadistica.http['x-client-ip']||tempEstadistica.http['x-forwarded-for']||'',
                                                        userAgent: tempEstadistica.http['user-agent']||'' } ) ;
                            /* return this.coneccion.collection( this.collectionNombre ) .updateOne({_id:tempEstadistica._id}, {$set: {...tempEstadistica}}, {upsert: true} ) ; */
                        } else {
                            tempEstadistica.cantidadVisitas = 1 ;
                            tempEstadistica.ts_insert       = this.fechaPais() ;
                            tempEstadistica.visitas.push( {timestamp: this.fechaPais(),
                                        query: tempEstadistica.http.query || {},
                                        ipAddres: tempEstadistica.http['x-client-ip']||tempEstadistica.http['x-forwarded-for']||'',
                                        userAgent: tempEstadistica.http['user-agent']||''} ) ;
                            /* return this.coneccion.collection( this.collectionNombre ) .insertOne( tempEstadistica ) ;*/
                        }
                        delete tempEstadistica.http ;
                        //let docSave = new this.colleccion( tempEstadistica ) ;
                        //
                        if ( tempEstadistica.cantidadVisitas>1 ){
                            this.colleccion.updateOne({_id: tempEstadistica._id },{$set:{...tempEstadistica}},{ new: true },
                                function(errSave,docGuardado){
                                    if ( errSave ){
                                        respRej(errSave) ;
                                    } else {
                                        respData( docGuardado ) ;
                                    }
                            }.bind(this));
                        } else {
                            let docSave = new this.colleccion( tempEstadistica ) ;
                            docSave.save(function(errSave,docGuardado){
                                if ( errSave ){
                                    respRej(errSave) ;
                                } else {
                                    respData( docGuardado ) ;
                                }
                            }.bind(this));
                        }
                        //
                    }.bind(this))
                    /*
                    .then(function(statInsertada){
                        respData( tempEstadistica ) ;
                    }.bind(this))
                    */
                    .catch(respRej) ;
                //
            } catch(errAddUrl){
                respRej(errAddUrl) ;
            }
        }.bind(this))
    }
    //
    findProducto(argObjBuca){
        return new Promise(function(respData,respRej){
            try {
                //
                let selector = {} ;
                if ( argObjBuca._id || argObjBuca.id ){
                    selector._id = argObjBuca._id || argObjBuca.id ;
                } else {
                    if ( argObjBuca.tipo ){
                        selector.tipo = argObjBuca.tipo || '' ;
                    } else {
                        selector = false ;
                    }
                }
                //
                if ( selector  ){
                    this.conectarBase( this.dbName )
                    .then(function(argDb){
                        // return this.promiseFind( this.collectionNombre, selector ) ;
                        return this.colleccion.find( selector, null, {lean: true} ).exec() ;
                    }.bind(this))
                    .then(function(resuUser){
                        respData( resuUser ) ;
                    }.bind(this))
                    .catch(respRej) ;
                } else {
                    respData( [] ) ;
                }
                //
            } catch(errGetCli){
                respRej(errGetCli) ;
            }
        }.bind(this)) ;
    }
    //
}
//
module.exports.classDb       = DbEstadisticas ;
module.exports.dbUrlInstance = (argConfiguracion) => {
    const objMongoDbMl = new DbEstadisticas(argConfiguracion) ;
    return objMongoDbMl ;
}
//