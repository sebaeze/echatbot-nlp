 /*
*
*/
//
import { userNavigator }                                from '@sebaeze/echatbot-mongodb'     ;
import { VARIABLES_GLOBALES }                           from '../dataModel/globals' ;
import { trainAsistente }                               from './training' ;
//
const { ConversationContext } = require('node-nlp')      ;
//
const CACHE_CONTEXT    = {} ;
const CACHE_CHATBOTS   = {} ;
//
const log          = require('debug')('WAIBOC:Chatbot') ;
const existInCache = (argId,argFlag) => {
    return new Promise(function(resOk,resRech){
        let outFlag = false ;
        if ( CACHE_CHATBOTS[argId] && argFlag==false ){
            outFlag = true ;
        }
        resOk(outFlag);
    });
} ;
//
export const assistantManager = (argDb) => {
    //
    const initChatbotManager = (argIdChatbot,argIdConversation) => {
        return new Promise(function(respOk,respRech){
            try {
                //
                argDb.chatbot.qry({ _id: argIdChatbot, camposTraining:{_id:1,idChatbot:1,name:1,systemDefined:1,domain:1,examples:1,entity:1,answer:1, slots:1} })
                    .then((respAsis)=>{
                        if ( respAsis.length>0 ){ respAsis=respAsis[0]; }
                        if ( !respAsis.training ){ respAsis.training=false; }
                        return trainAsistente({ intents: respAsis.training, chatbotLanguage: respAsis.language }) ;
                    })
                    .then((resTrained)=>{
                        CACHE_CHATBOTS[argIdChatbot]      = resTrained ;
                        respOk( resTrained ) ;
                        /*
                            context: CACHE_CONTEXT[argIdConversation]
                        }) ;
                        */
                    })
                    .catch((respErr)=>{
                        console.log('....ERROR: assistantManager:: getChatbotAgent: ',respErr) ;
                        respRech(respErr) ;
                    }) ;
                //
            } catch(respRech){
                log('ERROR: ',erriCM) ;
                respRech(erriCM) ;
            }
        }) ;
    } ;
    //
    const getChatbotAgent = (argIdAgente,argIdConversation,argflagForzarTraining=false) => {
        return new Promise(function(respOk,respRech){
            try {
                //
                existInCache(argIdAgente,argflagForzarTraining)
                    .then((botExist)=>{
                        log('....botExist: ',botExist) ;
                        if ( botExist==true ){
                            let outBotMng     = CACHE_CHATBOTS[argIdAgente] ;
                            outBotMng.context = CACHE_CONTEXT[argIdConversation] ;
                            return outBotMng ;
                        } else {
                            return initChatbotManager(argIdAgente,argIdConversation) ;
                        }
                    })
                    .then((botTrained)=>{
                        log('...botTrained: ',botTrained) ;
                        if ( !CACHE_CONTEXT[argIdConversation] ){ CACHE_CONTEXT[argIdConversation]=new ConversationContext(); }
                        respOk({
                            ...botTrained,
                            context: CACHE_CONTEXT[argIdConversation]
                         }) ;
                    })
                    .catch((respErr)=>{
                        console.log('....ERROR: assistantManager:: getChatbotAgent: ',respErr) ;
                        respRech(respErr) ;
                    }) ;
                /*
                if ( CACHE_CHATBOTS[argIdAgente] && argflagForzarTraining==false ){
                    let cacheAsistente = CACHE_CHATBOTS[argIdAgente] ;
                    log('getChatbotAgent:: cacheAsistente: ',cacheAsistente) ;
                    cacheAsistente.context = CACHE_CONTEXT[argIdConversation] ;
                    respOk( cacheAsistente ) ;
                } else {
                    CACHE_CHATBOTS[argIdAgente] = {} ;
                    argDb.chatbot.qry( {_id: argIdAgente, camposTraining:{_id:1,idChatbot:1,name:1,systemDefined:1,domain:1,examples:1,entity:1,answer:1, slots:1} } )
                        .then((respAsis)=>{
                            if ( respAsis.length>0 ){ respAsis=respAsis[0]; }
                            if ( !respAsis.training ){ respAsis.training=false; }
                            let chatbotTrained = trainAsistente({ intents: respAsis.training, chatbotLanguage: respAsis.language }) ;
                            CACHE_CHATBOTS[argIdAgente] = chatbotTrained ;
                            chatbotTrained.context = CACHE_CONTEXT[argIdConversation] || {} ;
                            respOk( chatbotTrained ) ;
                        })
                        .catch((respErr)=>{
                            console.log('....ERROR: assistantManager:: getChatbotAgent: ',respErr) ;
                            respRech(respErr) ;
                        }) ;
                }
                */
            } catch(errGetAs){
                console.dir(errGetAs) ;
                respRech(errGetAs) ;
            }
        }.bind(this)) ;
    } ;
    //
    const updateAsistenteContext = ( argIdAgente , argIdConversation , argContext=false ) => {
        return new Promise(function(respOk,respRech){
            try {
                if ( argContext!=false ){
                    //let cacheAsistente = CACHE_CHATBOTS[argIdAgente] ;
                    if ( typeof argIdConversation!="string" || argIdConversation.length==0 ){ throw new Error('ERROR: Falta el id de la conversacion') ; }
                    //if ( !cacheAsistente[argIdConversation] ){ cacheAsistente[argIdConversation]={}; }
                    //cacheAsistente[argIdConversation] = argContext ;
                    //CACHE_CHATBOTS[argIdAgente]       = cacheAsistente ;
                    CACHE_CONTEXT[argIdConversation] = argContext ;
                    log('....update context:: CACHE: ',CACHE_CONTEXT[argIdConversation]) ;
                    respOk({msg: `Asistente  ${argIdAgente} actualizado en cache.`}) ;
                } else {
                    respOk({msg:`Asistente no existe ${argIdAgente} en cache.`}) ;
                }
            } catch(errGetAs){
                console.log('...ERROR: updateAsistenteContext:: ',errGetAs) ;
                respRech(errGetAs) ;
            }
        }.bind(this)) ;
    } ;
    //
    return {
        get: getChatbotAgent,
        update: updateAsistenteContext
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
                let respValidd = {} ;
                argDb.conversacion.add( idChatbot ,tempUserNavigator,{ userMessage: '', answer: {output: { type: 'text', answer: [''] } } } )
                    .then((respChatMsg)=>{
                        if ( respChatMsg.length && respChatMsg.length>0 ){ respChatMsg=respChatMsg[0]; }
                        //respData({ idConversation: respChatMsg._id, chatlog: [] }) ;
                        respValidd = { idConversation: respChatMsg._id, chatlog: [], chatEvents: [] } ;
                        return argDb.intents.qry({ idChatbot: idChatbot, systemDefined: true, campos:{idChatbot:1,name:1,systemDefined:1,answer:1} }) ;
                    })
                    .then((respSysDefined)=>{
                        // console.log('....respSysDefined: ',respSysDefined) ;
                        respValidd.chatEvents = respSysDefined || []
                        respData( respValidd ) ;
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
        let idChatbot      = argReq.query.idChatbot      || argReq.body.idChatbot      || false ;
        if ( idChatbot && idChatbot=='false' ){ idChatbot=false; }
        let chatbotStatus  = {resultCode: VARIABLES_GLOBALES.RESULT_CODES.OK, idChatbot: idChatbot /* , botName:'',botSubtitle: '',language: '',description: '',validation: '',idConversation: '',chatlog: [] */} ;
        //
        argDb.chatbot.qry( {_id: idChatbot } )
            .then((arrBots)=>{
                if ( arrBots.length==0 ) {
                    chatbotStatus.resultCode = VARIABLES_GLOBALES.RESULT_CODES.CHATBOT_NOT_FOUND ;
                    chatbotStatus.error      = `Chatbot id# ${idChatbot} not found` ;
                    return [] ;
                } else {
                    if ( arrBots.length && arrBots.length>0 ){ arrBots=arrBots[0]; }
                    let chatbotIpDomain = argReq.hostname || argReq.host || argReq.get('host') || argReq.headers["x-forwarded-for"] || argReq.connection.remoteAddress ||  false ;
                    chatbotIpDomain = chatbotIpDomain.toUpperCase() ;
                    //
                    let flagOk = false ;
                    if ( chatbotIpDomain.indexOf('LOCALHOST')!=-1 || chatbotIpDomain.indexOf('127.0.0.1')!=-1 ){
                        flagOk = true ;
                    } else {
                        if ( !arrBots.websiteDomains || arrBots.websiteDomains.length==0 ){ arrBots.websiteDomains=[]; /* new Array(chatbotIpDomain);*/ }
                        console.log('...../session:: ') ;
                        console.dir(chatbotIpDomain) ;
                        console.dir(arrBots.websiteDomains) ;
                        flagOk = arrBots.websiteDomains.find((elemD)=>{ return String(chatbotIpDomain).toUpperCase().indexOf(String(elemD).toUpperCase())!=-1 ; }) ; // || false ;
                    }
                    //
                    chatbotStatus = {
                            resultCode: VARIABLES_GLOBALES.RESULT_CODES.OK ,
                            idChatbot: idChatbot,
                            botName: arrBots.botName,
                            botSubtitle: arrBots.botSubtitle,
                            language: arrBots.language,
                            description: arrBots.description,
                            validation: (flagOk==false ? 'INVALID_WEBSITE_DOMAIN' : arrBots.status ),
                            idConversation: '',
                            options: arrBots.options || {},
                            chatlog: []
                    } ;
                    //
                    return getConversationIdChatlog(argDb,argReq) ;
                    //
                }
            })
            .then((chatbotIdChatlog)=>{
                //
                if ( chatbotStatus.resultCode==VARIABLES_GLOBALES.RESULT_CODES.OK ){
                    chatbotStatus.idConversation = chatbotIdChatlog.idConversation ;
                    chatbotStatus.chatlog        = chatbotIdChatlog.chatlog || [] ;
                    chatbotStatus.chatEvents     = chatbotIdChatlog.chatEvents || [] ;
                } else {
                    chatbotStatus.validation = chatbotStatus.resultCode ;
                }
                respData( chatbotStatus ) ;
                //
            })
            .catch((errConv)=>{ console.log('..ERROR catch valida chatbot:: errConv:');console.dir(errConv); respRech(errConv); }) ;
            //
    } catch(errVCB){
      respRech(errVCB) ;
    }
  }) ;
} ;
//