/*
*
*/
const path                 = require('path') ;
const Db                   = require( path.join(__dirname,'./db') ).classDb        ;
const moment               = require('moment-timezone')     ;
const geoip                = require('geoip-lite')          ;
const schemaConversations  = require('./modelos/schemaConversations') ;
//
class dbConversation extends Db {
    //
    constructor(argConfigDb){
        super(argConfigDb) ;
        this.collectionNombre = 'conversations' ;
        this.colleccion       = this.coneccion.model(this.collectionNombre,schemaConversations) ;
    }
    //
    add(argNav,argMsg){
        return new Promise(function(respData,respRech){
            try {
                //
                this.conectarBase( this.dbName )
                    .then(function(argDb){
                        if ( argMsg._id ){
                            return this.colleccion.find( {_id:argMsg._id}, null, {lean: true} ).exec() ;
                        } else {
                            return this.utilMongo.promiseFindUpdate( this.colleccion , {} ) ;
                        }
                    }.bind(this))
                    .then(function(respMDB){
                        if ( respMDB._doc ){ respMDB = respMDB._doc; }
                        if ( Array.isArray(respMDB) ){ respMDB=respMDB[0]; }
                        let tempChat = {...argMsg} ;
                        delete tempChat._id ;
                        respMDB.conversation.push({
                            ts: moment( new Date() ).tz("America/Argentina/Buenos_Aires").format() ,
                            ...tempChat
                        }) ;
                        /*  */
                        if ( !Array.isArray(respMDB.userNavigator)){ respMDB.userNavigator=[]; }
                        if ( respMDB.userNavigator.length==0 || respMDB.userNavigator[respMDB.userNavigator.length-1].ip!=argNav.ip ){
                            respMDB.userNavigator.push({
                                ts_creation: moment( new Date() ).tz("America/Argentina/Buenos_Aires").format(),
                                geo: geoip.lookup(argNav.ip),
                                ...argNav
                            })  ;
                        }
                        respMDB.userNavigator[respMDB.userNavigator.length-1].ts_last_update = moment( new Date() ).tz("America/Argentina/Buenos_Aires").format() ;
                        /*  */
                        respMDB.ts_last_update = moment( new Date() ).tz("America/Argentina/Buenos_Aires").format() ;
                        if ( respMDB._v ){ delete respMDB._v; }
                        if ( respMDB.__v ){ delete respMDB.__v; }
                        return this.utilMongo.promiseFindUpdate( this.colleccion , respMDB ) ;
                    }.bind(this))
                    .then(function(respAdd){
                        if ( !argMsg._id ){ argMsg._id=respAdd._id; }
                        respData( argMsg ) ;
                    }.bind(this))
                    .catch(respRech) ;
                //
            } catch(errAddM){
                respRech(errAddM) ;
            }
        }.bind(this)) ;
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
module.exports.classDb       = dbConversation ;
module.exports.dbUrlInstance = (argConfiguracion) => {
    const objMongoDbMl = new dbConversation(argConfiguracion) ;
    return objMongoDbMl ;
}
//