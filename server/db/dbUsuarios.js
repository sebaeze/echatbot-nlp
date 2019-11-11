/*
*
*/
const Db              = require('./db').classDb        ;
const schemaUsuarios  = require('./modelos/schemaUsuarios') ;
//
class dbUsuarios extends Db {
    //
    constructor(argConfigDb){
        super(argConfigDb) ;
        this.collectionNombre = 'usuarios' ;
        this.colleccion       = this.coneccion.model(this.collectionNombre,schemaUsuarios) ;
    }
    //
    add(argObjUser){
        return new Promise(function(respData,respRej){
            try {
                //
                if ( !Array.isArray(argObjUser) ){ argObjUser=new Array(argObjUser);  } ;
                if ( Array.isArray(argObjUser) && argObjUser.length==0 ){ return([]); } ;
                let flagUsrSinID = false ;
                for( let posUsr=0;posUsr<argObjUser.length;posUsr++){
                    if ( !argObjUser[posUsr]._id ){
                        if ( argObjUser[posUsr].email || argObjUser[posUsr].id ){
                            argObjUser[posUsr]._id = argObjUser[posUsr].email || argObjUser[posUsr].id ;
                        } else {
                            flagUsrSinID = true ;
                        }
                    }
                }
                if ( flagUsrSinID==true ){
                    respRej( {error: 'No existe campo _id en objeto',elemento:argObjUser} ) ;
                } else {
                //
                this.conectarBase( this.dbName )
                    .then(function(argDb){
                        //
                        let arrayPromises = [] ;
                        argObjUser.forEach(elemUsr => {
                            arrayPromises.push( this.utilMongo.promiseFindUpdate( this.colleccion , elemUsr ) ) ;
                        }) ;
                        if ( arrayPromises.length>0 ){
                            return Promise.all( arrayPromises ) ;
                        } else {
                            return [] ;
                        }
                        //
                    }.bind(this))
                    .then(function(argArrayUsrInserted){
                        respData( argObjUser ) ;
                    }.bind(this))
                    .catch(respRej) ;
                }
                //
            } catch(errAddUrl){
                respRej(errAddUrl) ;
            }
        }.bind(this))
    }
    //
    BORRAR_merge(argObjUser){
        return new Promise(function(respData,respRej){
            try {
                //
                if ( !argObjUser._id && argObjUser.email ){ argObjUser._id = argObjUser.email; }
                // Solo controla primer usuario si existieran varios
                if ( !argObjUser._id ){
                    respRej( {error: 'No existe campo _id en objeto',elemento:argObjUser} ) ;
                }
                //
                this.conectarBase( this.dbName )
                    .then(function(argDb){
                        return this.coneccion.collection( this.collectionNombre )
                                             .updateOne({_id:argObjUser._id}, {$set: {...argObjUser}}, {upsert: true} ) ;
                    }.bind(this))
                    .then(function(argArrayUsrInserted){
                        respData( argObjUser ) ;
                    }.bind(this))
                    .catch(respRej) ;
                //
            } catch(errAddUrl){
                respRej(errAddUrl) ;
            }
        }.bind(this))
    }
    //
    get(argObjBusqueda){
        return new Promise(function(respData,respRej){
            try {
                //
                this.conectarBase( this.dbName )
                    .then(function(argDb){
                        //
                        return this.colleccion.find( argObjBusqueda, null, {lean: true} ).exec() ;
                        //
                    }.bind(this))
                    .then(function(arrayClientes){
                        respData( arrayClientes ) ;
                    }.bind(this))
                    .catch(respRej) ;
                //
            } catch(errGetCli){
                respRej(errGetCli) ;
            }
        }.bind(this)) ;
    }
    //
    accesos(argEmail){
        return new Promise(function(respData,respRej){
            try {
                //
                this.conectarBase( this.dbName )
                    .then(function(argDb){
                        return this.colleccion.find( {email:argEmail}, "email accesos", {lean: true} ).exec() ;
                    }.bind(this))
                    .then(function(arrayClientes){
                        respData( arrayClientes ) ;
                    }.bind(this))
                    .catch(respRej) ;
                //
            } catch(errGetCli){
                respRej(errGetCli) ;
            }
        }.bind(this)) ;
    }
    //
    getClientes(argSellerId,argOpciones={soloId:true} ){
        return new Promise(function(respData,respRej){
            try {
                //
                let tempIdSeller = (typeof argSellerId=='object') ? argSellerId.id||argSellerId._id : argSellerId ;
                console.log('getClientes::tempIdSeller: '+tempIdSeller+';') ;
                //
                this.conectarBase( this.dbName )
                    .then(function(argDb){
                        let selector = {_id: parseInt(tempIdSeller)} ;
                        return this.coneccion.collection( this.collectionNombre )
                                            .findOne( selector, {projection:{_id:0, ventasRealizadas:1 }} ) ;
                    }.bind(this))
                    .then(function(arrayVentasRealizadas){
                        //this.coneccion.cerrar() ;
                        if ( argOpciones.soloId==true ){
                            return this.parsearClientesVentas(arrayVentasRealizadas.ventasRealizadas) ;
                        } else {
                            return arrayVentasRealizadas.ventasRealizadas ;
                        }
                    }.bind(this))
                    .then(function(arrayClientes){
                        respData( arrayClientes ) ;
                    }.bind(this))
                    .catch(respRej) ;
                //
            } catch(errGetCli){
                respRej(errGetCli) ;
            }
        }.bind(this)) ;
    }
    //
    getVisitas(argSellerId){
        return new Promise(function(respData,respRej){
            try {
                //
                let tempIdSeller = (typeof argSellerId=='object') ? argSellerId.id||argSellerId._id : argSellerId||false ;
                this.conectarBase( this.dbName )
                    .then(function(argDb){
                        let selector = {} ;
                        if ( tempIdSeller ){
                            selector = {_id: parseInt(tempIdSeller)} ;
                        }
                        return this.coneccion.collection( this.collectionNombre )
                                            .find( selector, {projection:{_id:0, nickname:1, country_id:1, visitas:1 }} )
                                            .toArray() ;
                    }.bind(this))
                    .then(function(arrayClientes){
                        respData( arrayClientes ) ;
                    }.bind(this))
                    .catch(respRej) ;
                //
            } catch(errGetCli){
                respRej(errGetCli) ;
            }
        }.bind(this)) ;
    }
    //
    parsearClientesVentas(argArrayVentas){
        let objClientes = {} ;
        try {
            for(let posVenta=0;posVenta<argArrayVentas.length;posVenta++){
                let objVenta = argArrayVentas[posVenta] ;
                if ( !objClientes[objVenta.buyer.id] ){
                    objClientes[objVenta.buyer.id] = objVenta.buyer ;
                }
            }
        } catch(errParsearCli){
            throw errParsearCli ;
        }
        return Object.keys(objClientes) ;
    }
    //
    update(argArrayUsuarios){
        return new Promise(function(respData,respRej){
            try {
                if ( !Array.isArray(argArrayUsuarios) ){ respRej( {error:'dbUsuarios::update:: Argumento debe ser array.'} ); }
            } catch(errUpd){
                respRej(errUpd) ;
            }
        }.bind(this)) ;
    }
    //
}
//
module.exports.classDb       = dbUsuarios ;
module.exports.dbUrlInstance = (argConfiguracion) => {
    const objMongoDbMl = new dbUsuarios(argConfiguracion) ;
    return objMongoDbMl ;
}
//