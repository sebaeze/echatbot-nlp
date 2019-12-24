 /*
*
*/
const { NlpManager }            = require('node-nlp')   ;
import { userNavigator }        from 'echatbot-mongodb' ;
//
const cacheSessiones   = {} ;
/*
const defaultTraining = [
        {
            "domain":"WELCOME",
            "entity":"WELCOME.INITIAL",
            "examples":["WELCOME.INITIAL"],
            "answer":{
                    //type:'option',
                    type:'carousel',
                    title:"<div><span>Hola !</span><span>Gracias por contactarme</span><span>En que te puedo ayudar ?</span></div>",
                    options:[
                        {label:"Ayuda",value:"trolo"},
                        {label:"Nose",value:"2"},
                        {label:"Que se yo",value:"3"},
                        {label:"Vose",value:"4"}
                    ] }
        },
		{
			"domain":"chat",
			"entity":"chat.greeting",
            "examples":["hola","hi","como andas ?","que haces?","que hacias?"],
            "answer":{type:'text',answer:"Hola, ¿ como te puedo ayudar ?"}
        },
        {
			"domain":"chat",
			"entity":"chat.chau",
            "examples":["me voy","chau","ya fue","nos vemos","ahi nos olemos"],
            "answer": {type:"image",source:"/img/china.jpg"}
        },
        {
			"domain":"simpsons",
			"entity":"simpsons.nerd",
            "examples":["nerd","inteligente","anda a estudiar"],
            "answer": {type:"image",source:"/img/nerd.gif"}
		},
        {
			"domain":"simpsons",
			"entity":"simpsons.fanatico",
            "examples":["simpsons","ay caramba!","a la grande le puse cuca","marge"],
            "answer": {type:"option",title:"Fanatico de los simpsons, deberas elejir:",
                options:[
                {value:"hola",label:"mandando saludosss"},
                {value:"lavadora",label:"La lavadora"},
                {value:"caja",label:"la caja"}
            ]}
        },
        {
			"domain":"simpsons",
			"entity":"simpsons.plandental",
            "examples":["plan dental"],
            "answer":{type:'text',answer:"Liza necesita frenos"}
        },
        {
			"domain":"simpsons",
			"entity":"simpsons.lizanecesitarenos",
            "examples":["Liza necesita frenos"],
            "answer":{type:'text',answer:"plan dental"}
        },
        {
			"domain":"puteadas",
			"entity":"puteadas.mal",
            "examples":["putaso","trolo","hijo de puta","HDP","concha de tu madre",],
            "answer": {type:"image",source:"/img/escribir.gif",alt:"Lo voy a anotar en mi maquina de escribir invisible"}
        },
    ] ;
*/
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
                    manager.addDocument( argLanguage , elemExample , objTrain.entity );
                }) ;
                manager.addAnswer( argLanguage , objTrain.entity , objTrain.answer );
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
                //
                if ( cacheSessiones[argIdAgente] && argflagForzarTraining==false ){
                    let cacheAsistente = cacheSessiones[argIdAgente] ;
                    respOk( cacheAsistente ) ;
                    //
                } else {
                    console.log('....getAsistente::voy a agregar el agente:: '+argIdAgente+';') ;
                    cacheSessiones[argIdAgente] = {} ;
                    //
                    argDb.chatbot.qry( {_id:argIdAgente} )
                        .then((respAsis)=>{
                            //
                            if ( respAsis.length>0 ){ respAsis=respAsis[0]; }
                            if ( !respAsis.training ){ respAsis.training=false; }
                            cacheSessiones[argIdAgente] = trainAsistente(respAsis.language,respAsis.training) ;
                            //
                            respOk( cacheSessiones[argIdAgente] ) ;
                            //
                        })
                        .catch((respErr)=>{
                            console.dir(respErr) ;
                            respRech(respErr) ;
                        }) ;
                }
                //
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