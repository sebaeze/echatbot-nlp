/*
*
*/
import { opcionesPOST }                                          from '../utils/parametros' ;
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