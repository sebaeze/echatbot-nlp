 /*
*
*/
const { NlpManager, ConversationContext  }               = require('node-nlp')      ;
import { userNavigator }                                from '@sebaeze/echatbot-mongodb'     ;
import { VARIABLES_GLOBALES }                           from '../dataModel/globals' ;
//
const cacheSessiones   = {} ;
export const EOF_LINE =  " __EOF_LINE__" ;
//
export const updateBotOutput = (argAnswer,argContext) => {
    try {
        //
        let outUpdated = {...argAnswer} ;
        if ( outUpdated.entities && outUpdated.entities.length>0 ){
            outUpdated.entities.forEach((elem)=>{
                let textAnswer = (outUpdated.answer && elem.entity && outUpdated.answer.text) ?  outUpdated.answer.text : false ;
                if ( textAnswer && textAnswer.toUpperCase().indexOf(elem.entity.toUpperCase())!=-1 ){
                    let entityVal      = elem.utteranceText ;
                    let arrayVariables = textAnswer.match( /\##(.*?)\##/g ) ;
                    arrayVariables.forEach((elemEntity)=>{
                        outUpdated.answer.text = outUpdated.answer.text.replace( elemEntity , elemEntity.toUpperCase() ) ;
                    }) ;
                    outUpdated.answer.text = outUpdated.answer.text.replace( elem.entity , entityVal ) ;
                }
            }) ;
        }
        //
        if ( outUpdated.answer && outUpdated.answer.text && outUpdated.answer.text.indexOf('##')!=-1 ){
            for ( let keyCtx in argContext ){
                let textVar = argContext[keyCtx] || '' ;
                if ( textVar.length>0 ){
                    if ( outUpdated.answer.text.toUpperCase().indexOf(keyCtx)>-1 ){
                        let arrayVariables = outUpdated.answer.text.match( /\##(.*?)\##/g ) ;
                        arrayVariables.forEach((elemVar)=>{
                            outUpdated.answer.text = outUpdated.answer.text.replace(elemVar,elemVar.toUpperCase()) ;
                        }) ;
                        outUpdated.answer.text = outUpdated.answer.text.replace( keyCtx , textVar ) ;
                    }
                }
            }
        }
        //
        if ( outUpdated && outUpdated.answer && outUpdated.answer.text){
            outUpdated.answer.text = outUpdated.answer.text.replace(EOF_LINE,"") ;
        }
        //
        return outUpdated ;
    } catch(errRV){
        console.log('....error: ',errRV) ;
        throw errRV ;
    }
}
//
const addTrimmedVariables = (argMng,argEntity,argLang,argText) => {
    let outResult = {text: argText} ;
    try {
        //
        if ( argText.indexOf('##')==-1 ){ return false; }
        //
        let arrayVariables = argText.match( /\##(.*?)\##/g ) ;
        for ( let posV=0; posV<arrayVariables.length; posV++ ){
            let elemVar      = arrayVariables[posV] ;
            const arrBetween = argText.split(elemVar) ;
            // elemVar          = elemVar.replace(/#/g,"") ;
            elemVar = elemVar.toUpperCase() ;
            if ( elemVar.substr(0,2)!="##" ){ elemVar="##"+elemVar; }
            if ( elemVar.substr((elemVar.length-2),2)!="##" ){ elemVar=elemVar+"##"; }
            //
            // elemVar = elemVar.toUpperCase() ;
            argText = argText.replace(elemVar,elemVar.toUpperCase()) ;
            outResult.text = argText ;
            elemVar = elemVar.toUpperCase() ;
            //
            if ( arrBetween.length>1 ){
                // console.log('...addTrimmedVariables: elemVar: ',elemVar,';') ;
               if ( arrBetween[1] && arrBetween[1].trim().length>0 ){
                argMng.addBetweenCondition( argLang , elemVar , arrBetween[0].trim() , arrBetween[1].trim() ) ;
               } else {
                argMng.addBetweenCondition( argLang , elemVar , arrBetween[0].trim() , EOF_LINE.trim() ) ;
               }
            }
            // console.log('....(a) addTrimmedVariables: argEntity: ',argEntity,' elemVar: ',elemVar,';') ;
            /*
            // Search if the Slot is available
            let arraySlots = argSlots.filter((elemSlot)=>{
                return ("##"+elemSlot.name+"##").toUpperCase()==elemVar.toUpperCase() ;
            }) ;
            //
            arraySlots.forEach((slot2Add)=>{
                addSlotToBot(argMng,argEntity,slot2Add) ;
            })
            */
            //
            /*
            let objEntity = {} ;
            objEntity[ argLang ] = {
                api: '',
                text: `slot ==> ${argText}`,
                files: []
            } ;
            argMng.nlp.slotManager.addSlot( argEntity, elemVar , true,  objEntity ) ;
            */
        }
        //
    } catch(errADV){
        console.log('...errADV: ',errADV) ;
    }
    return outResult ;
} ;
//
const addSlotToBot = (argMng,argEntity,argSlot) => {
    try {
        //
        if ( argSlot.name.substr(0,2)!="##" ){ argSlot.name="##"+argSlot.name; }
        if ( argSlot.name.substr((argSlot.name.length-2),2)!="##" ){ argSlot.name=argSlot.name+"##"; }
        //
        let objSlot2Add = {} ;
        objSlot2Add[ argSlot.language ] = {
            api: '',
            text: argSlot.question ,
            files: []
        } ;
        // console.log('.....(B) addSlotToBot: argEntity: ',argEntity,' argSlot.name: ',argSlot.name,';') ;
        argMng.nlp.slotManager.addSlot( argEntity, argSlot.name , true,  objSlot2Add ) ;
        //
    } catch(errADV){
        console.log('...errADV: ',errADV) ;
    }
} ;
//
export const trainAsistente = ( argOptions ) => {
    return new Promise(function(respOk,respRech){
        try {
            const { intents, chatbotLanguage } = argOptions ;
            const manager = new NlpManager({
                            languages: ['es', 'en', 'pt'],
                            nlu: { log: false, useNoneFeature: true }
                            /*
                            processTransformer: function (originalProcessOutput) {
                                let outUpdated = updateBotOutput( originalProcessOutput ) ;
                                return outUpdated ;
                            }
                            */
                        }) ;
            const context = new ConversationContext() ;
            //
            let tempArrayTrain = typeof intents=="object" ? Object.values(intents) : intents ;
            let tempEntity     = {} ;
            manager.chatEvents = {} ;
            //
            for( let ix=0; ix<tempArrayTrain.length;ix++){
                let objTrain     = tempArrayTrain[ix] ;
                let tempLanguage = objTrain.language ? objTrain.language : chatbotLanguage ;
                if ( !tempEntity[objTrain.domain] ){
                    tempEntity[objTrain.entity] = objTrain.entity ;
                    manager.assignDomain( tempLanguage, objTrain.entity , objTrain.domain );
                }
                if ( !objTrain.examples ){ objTrain.examples=[]; }
                //
                if ( objTrain.systemDefined==true ){
                    manager.chatEvents[ objTrain.name ] = objTrain ;
                }
                //
                objTrain.examples.forEach((elemExample)=>{
                    try {
                        if ( elemExample && elemExample!=null ){
                            if ( elemExample.indexOf('##')!=-1 ){
                                let resuAddVar = addTrimmedVariables(manager,objTrain.entity,tempLanguage,elemExample) ;
                                elemExample = resuAddVar.text ;
                            }
                            manager.addDocument( tempLanguage , elemExample , objTrain.entity );
                        }
                    } catch(errADDd){
                        console.log('....ERROR: addDocumento:: train:: errADDd: ',errADDd,' \n objTrain: ',objTrain) ;
                    }
                }) ;
                // Slots Filling
                try {
                    // console.log('.1_objTrain.entity: ',objTrain.entity,' objTrain.slots: ',objTrain.slots) ;
                    if ( objTrain.slots && objTrain.slots.length>0 ){
                        for ( let posS=0; posS<objTrain.slots.length; posS++ ){
                            addSlotToBot( manager , objTrain.entity , objTrain.slots[posS] ) ;
                        }
                    }
                } catch(errAS){
                    console.log('...errAS: ',errAS) ;
                }
                //
                try {
                    manager.addAnswer( tempLanguage , objTrain.entity , objTrain.answer );
                } catch(errADDd){
                    console.log('....ERROR: addAnswer:: train:: errADDd: ',objTrain) ;
                }
            }
            //
            manager.train()
                .then((respTrain)=>{
                    console.log('....termino de entrenar') ;
                    respOk({
                        nlp: manager,
                        context: context
                    }) ;
                })
                .catch((respErr)=>{
                    console.dir(respErr) ;
                    respRech(respErr) ;
                }) ;
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
                    argDb.chatbot.qry( {_id:argIdAgente, camposTraining:{_id:1,idChatbot:1,name:1,systemDefined:1,domain:1,examples:1,entity:1,answer:1, slots:1} } )
                        .then((respAsis)=>{
                            if ( respAsis.length>0 ){ respAsis=respAsis[0]; }
                            if ( !respAsis.training ){ respAsis.training=false; }
                            cacheSessiones[argIdAgente] = trainAsistente({ intents: respAsis.training, chatbotLanguage: respAsis.language }) ;
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