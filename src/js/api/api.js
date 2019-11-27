/*
*
*/
import { PARAMETROS, opcionesPOST, obj2qryString }       from '../utils/parametros' ;
import ls                                                from 'local-storage'    ;
//
export const fetchChatlog = (argQry) => {
    return new Promise(function(respOk,respRech){
        try {
            //
            let getOpt  = {...opcionesPOST} ;
            getOpt.method = 'GET' ;
            delete  getOpt.body ;
            //
            let tempUrlBackend = __URL_BACKEND__ + '/chatbot/chatlog' + obj2qryString(argQry) ;
            fetch( tempUrlBackend ,getOpt)
                    .then(function(response){
                        if (response.status>=200 & response.status<=400) {
                            return response.json() ;
                        } else {
                            throw new Error("ERROR: GET chatlog. Http Status: "+response.status+'.') ;
                        }
                    }.bind(this))
                    .then(function(respNlp   ){
                        respOk(respNlp) ;
                    }.bind(this))
                    .catch((respRechaz ) => { respRech(respRechaz) ; }) ;
            //
        } catch(errFH){
            respRech(errFH) ;
        }
    }) ;
} ;
//
export const getIdConversation = () => {
    return new Promise(function(respData,respRech){
        try {
            let idConversation = ls( PARAMETROS.SESSION.ID_CONVERSATION ) || false ;
            if ( idConversation ){
                fetchChatlog( {_id:idConversation} )
                    .then((respLog)=>{
                        respData({id:idConversation, chatLog:respLog}) ;
                    })
                    .catch(respRech) ;
            } else {
                fetchChatbot( {input: {text:'quiero un session ID'}} )
                    .then((respCB)=>{
                        idConversation = respCB._id ;
                        ls( PARAMETROS.SESSION.ID_CONVERSATION, idConversation ) ;
                        respData({id:idConversation,chatLog:[]}) ;
                    })
                    .catch(respRech) ;
            }
        } catch(errGIC){
            console.dir(errGIC) ;
            respRech(errGIC) ;
        }
    }) ;
} ;
//
export const fetchChatbot = (argOpt) => {
    return new Promise(function(respOk,respRech){
        try {
            //
            let postOpt  = {...opcionesPOST} ;
            postOpt.body = JSON.stringify( argOpt ) ;
            //
            let tempUrlBackend = __URL_BACKEND__+'/chatbot/mensaje' ;
            // console.log('...tempUrlBackend: '+tempUrlBackend+';') ;
            fetch( tempUrlBackend ,postOpt)
                    .then(function(response){
                        if (response.status>=200 & response.status<=400) {
                            return response.json() ;
                        } else {
                            throw new Error("ERROR: ADD Productos nuevos. Http Status: "+response.status+'.') ;
                        }
                    }.bind(this))
                    .then(function(respNlp   ){
                        respOk(respNlp) ;
                    }.bind(this))
                    .catch((respRechaz ) => { respRech(respRechaz) ; }) ;
            //
        } catch(errFC){
            console.dir(errFC) ;
            respRech(errFC) ;
        }
    }) ;
} ;
//