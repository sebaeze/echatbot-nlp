/*
dbChatbots
*/
const Db              = require('./db').classDb        ;
const schemaUsuarios  = require('./modelos/schemaChatbots') ;
//
class dbChatbots extends Db {
    //
    constructor(argConfigDb){
        super(argConfigDb) ;
        this.collectionNombre = 'chatbots' ;
        this.colleccion       = this.coneccion.model(this.collectionNombre,schemaUsuarios) ;
    }
    //
    qry(argObjBusqueda){
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
}
//
module.exports.classDb       = dbChatbots ;
module.exports.dbUrlInstance = (argConfiguracion) => {
    const objMongoDbMl = new dbChatbots(argConfiguracion) ;
    return objMongoDbMl ;
}
//