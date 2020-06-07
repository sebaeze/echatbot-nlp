//
const { NlpManager, ConversationContext  }              = require('node-nlp')      ;
const log = require('debug')('WAIBOC:Training') ;
//
export const EOF_LINE =  " __EOF_LINE__" ;
//
export const updateBotOutput = (argAnswer,argChatbotAgent /* argContext */ ) => {
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
                    argChatbotAgent.context[ elem.entity ] = entityVal ;
                }
            }) ;
        }
        //
        if ( outUpdated.answer && outUpdated.answer.text && outUpdated.answer.text.indexOf('##')!=-1 ){
            let arrayVariables = outUpdated.answer.text.match( /\##(.*?)\##/g ) ;
            //
            for ( let posS=0; posS<arrayVariables.length; posS++ ){
                let slotVar    = arrayVariables[ posS ] ;
                let contextVal = argChatbotAgent.context[ slotVar.toUpperCase() ] || "" ;
                outUpdated.answer.text = outUpdated.answer.text.replace( slotVar , slotVar.toUpperCase() ) ;
                outUpdated.answer.text = outUpdated.answer.text.replace( slotVar.toUpperCase() , contextVal ) ;
                console.log('...slotVar: ',slotVar,' contextVal: ',contextVal,' text: ',outUpdated.answer.text,';') ;
            }
            //
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
            elemVar = elemVar.toUpperCase() ;
            if ( elemVar.substr(0,2)!="##" ){ elemVar="##"+elemVar; }
            if ( elemVar.substr((elemVar.length-2),2)!="##" ){ elemVar=elemVar+"##"; }
            // Hay que remover el slot del entrenamiento para evitar falsos positivos en NLP
            argText = argText.replace(elemVar," ") ;
            outResult.text = argText ;
            elemVar = elemVar.toUpperCase() ;
            //
            if ( arrBetween.length>1 ){
               if ( arrBetween[1] && arrBetween[1].trim().length>0 ){
                argMng.addBetweenCondition( argLang , elemVar , arrBetween[0].trim() , arrBetween[1].trim() ) ;
               } else {
                argMng.addBetweenCondition( argLang , elemVar , arrBetween[0].trim() , EOF_LINE.trim() ) ;
               }
            }
            //
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
        // log('.....(B) addSlotToBot: argEntity: ',argEntity,' argSlot.name: ',argSlot.name,';') ;
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
                if ( objTrain.name.toUpperCase()!="NONE" ){
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
            }
            //
            manager.train()
                .then((respTrain)=>{
                    log('trainAsistente:: Termino de entrenar') ;
                    respOk({
                        nlp: manager,
                        language: chatbotLanguage
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