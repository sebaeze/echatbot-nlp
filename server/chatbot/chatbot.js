 /*
*
*/
const { NlpManager }            = require('node-nlp')   ;
import { userNavigator }        from 'echatbot-mongodb' ;
//
const cacheSessiones   = {} ;
//
export const trainAsistente = (argLanguage,argTraining) => {
    return new Promise(function(respOk,respRech){
        try {
            const manager = new NlpManager({ languages: ['es', 'en', 'pt'] });
            // if ( !argTraining || Object.keys(argTraining).length==0 ||argTraining==false || argTraining=='false' ){ console.log('...voy a Training default');argTraining=defaultTraining; }
            let tempArrayTrain = typeof argTraining=="object" ? Object.values(argTraining) : argTraining ;
            let tempEntity     = {} ;
            for( let ix=0; ix<tempArrayTrain.length;ix++){
                let objTrain = tempArrayTrain[ix] ;
                if ( !tempEntity[objTrain.domain] ){
                    tempEntity[objTrain.entity] = objTrain.entity ;
                    manager.assignDomain( argLanguage, objTrain.entity , objTrain.domain );
                }
                objTrain.examples.forEach((elemExample)=>{
                    try {
                        if ( elemExample && elemExample!=null ){
                            manager.addDocument( argLanguage , elemExample , objTrain.entity );
                        }
                    } catch(errADDd){
                        console.log('....ERROR: addDocumento:: train:: errADDd: ',errADDd,' \n objTrain: ',objTrain) ;
                    }
                }) ;
                try {
                    manager.addAnswer( argLanguage , objTrain.entity , objTrain.answer );
                } catch(errADDd){
                    console.log('....ERROR: addAnswer:: train:: errADDd: ',objTrain) ;
                }
            }
            //
            manager.train()
                .then((respTrain)=>{
                    console.log('....termino de entrenar') ;
                    respOk(manager) ;
                })
                .catch((respErr)=>{
                    console.dir(respErr) ;
                    respRech(respErr) ;
                }) ;
            //
            //const classifications = manager.process('hello');
            //console.log(classifications);
            //
        } catch(errTNLP){
            console.dir(errTNLP) ;
            respRech(errTNLP) ;
        }
    }) ;
}
//
export const assistantManager = (argDb) => {
    //
    const getAsistente = (argIdAgente,argflagForzarTraining=false) => {
        return new Promise(function(respOk,respRech){
            try {
                if ( cacheSessiones[argIdAgente] && argflagForzarTraining==false ){
                    let cacheAsistente = cacheSessiones[argIdAgente] ;
                    respOk( cacheAsistente ) ;
                } else {
                    cacheSessiones[argIdAgente] = {} ;
                    argDb.chatbot.qry( {_id:argIdAgente} )
                        .then((respAsis)=>{
                            if ( respAsis.length>0 ){ respAsis=respAsis[0]; }
                            if ( !respAsis.training ){ respAsis.training=false; }
                            cacheSessiones[argIdAgente] = trainAsistente(respAsis.language,respAsis.training) ;
                            respOk( cacheSessiones[argIdAgente] ) ;
                        })
                        .catch((respErr)=>{
                            console.log('....ERROR: assistantManager:: getAsistente: ',respErr) ;
                            respRech(respErr) ;
                        }) ;
                }
            } catch(errGetAs){
                console.dir(errGetAs) ;
                respRech(errGetAs) ;
            }
        }.bind(this)) ;
    } ;
    //
    return {
        get: getAsistente
    } ;
} ;
//
export const getConversationIdChatlog = (argDb,argReq) => {
    return new Promise(function(respData,respRech){
        try {
             //
             let idChatbot      = argReq.query.idChatbot      || argReq.body.idChatbot      || false ;
             let idConversation = argReq.query.idConversation || argReq.body.idConversation || false ;
             //
             if ( idChatbot      && idChatbot=='false' ){ idChatbot=false; }
             if ( idConversation && idConversation=='false' ){ idConversation=false; }
             //
             if ( idConversation ){
                argDb.conversacion.qry( {_id: idConversation} )
                    .then((respChatlog)=>{
                        if ( respChatlog.length && respChatlog.length>0 ){ respChatlog=respChatlog[0]; }
                        respData({ idConversation: idConversation, chatlog: respChatlog.conversation }) ;
                    })
                    .catch((errChatlog)=>{ respRech(errChatlog) ; }) ;
             } else {
                let tempUserNavigator   = Object.assign({...userNavigator},argReq.headers) ;
                tempUserNavigator.ip    = argReq.ip || '' ;
                argDb.conversacion.add( idChatbot ,tempUserNavigator,{ userMessage: '', answer: {output: { type: 'text', answer: [''] } } } )
                    .then((respChatMsg)=>{
                        if ( respChatMsg.length && respChatMsg.length>0 ){ respChatMsg=respChatMsg[0]; }
                        respData({ idConversation: respChatMsg._id, chatlog: [] }) ;
                    })
                    .catch((errChatlog)=>{ respRech(errChatlog) ; }) ;
             }
        } catch(errNC){
            respRech(errNC) ;
        }
    }) ;
} ;
//
export const validateChatbotAgent = (argDb,argReq) => {
  return new Promise(function(respData,respRech){
    try {
        //
        let chatbotStatus = {idChatbot:'', botName:'',botSubtitle: '',language: '',description: '',validation: '',idConversation: '',chatlog: [] } ;
        let idChatbot      = argReq.query.idChatbot      || argReq.body.idChatbot      || false ;
        if ( idChatbot      && idChatbot=='false' ){ idChatbot=false; }
        //
        argDb.chatbot.qry( {_id: idChatbot } )
            .then((arrconversation)=>{
                if ( arrconversation.length && arrconversation.length>0 ){ arrconversation=arrconversation[0]; }
                let chatbotIpDomain = argReq.hostname || argReq.host || argReq.get('host') || argReq.headers["x-forwarded-for"] || argReq.connection.remoteAddress ||  false ;
                chatbotIpDomain = chatbotIpDomain.toUpperCase() ;
                //
                let flagOk = false ;
                if ( chatbotIpDomain.indexOf('LOCALHOST')!=-1 || chatbotIpDomain.indexOf('127.0.0.1')!=-1 ){
                    flagOk = true ;
                } else {
                    if ( !arrconversation.websiteDomains || arrconversation.websiteDomains.length==0 ){ arrconversation.websiteDomains=[]; /* new Array(chatbotIpDomain);*/ }
                    console.log('...../session:: ') ;
                    console.dir(chatbotIpDomain) ;
                    console.dir(arrconversation.websiteDomains) ;
                    flagOk = arrconversation.websiteDomains.find((elemD)=>{ return String(chatbotIpDomain).toUpperCase().indexOf(String(elemD).toUpperCase())!=-1 ; }) ; // || false ;
                }
                //
                chatbotStatus = {
                        idChatbot: idChatbot,
                        botName: arrconversation.botName,
                        botSubtitle: arrconversation.botSubtitle,
                        language: arrconversation.language,
                        description: arrconversation.description,
                        validation: (flagOk==false ? 'INVALID_WEBSITE_DOMAIN' : arrconversation.status ),
                        idConversation: '',
                        options: arrconversation.options || {},
                        chatlog: []
                } ;
                //
                return getConversationIdChatlog(argDb,argReq) ;
                //
            })
            .then((chatbotIdChatlog)=>{
                //
                chatbotStatus.idConversation = chatbotIdChatlog.idConversation ;
                chatbotStatus.chatlog        = chatbotIdChatlog.chatlog ;
                respData( chatbotStatus ) ;
                //
            })
            .catch((errConv)=>{ conole.log('..ERROR catch valida chatbot:: errConv:');console.dir(errConv); respRech(errConv); }) ;
            //
    } catch(errVCB){
      respRech(errVCB) ;
    }
  }) ;
} ;
//