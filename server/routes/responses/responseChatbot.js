/*
*
*/
import { updateBotOutput, EOF_LINE }           from '../../chatbot/training' ;
import { userNavigator }                       from '@sebaeze/echatbot-mongodb/dist/modelos/schemaConversations' ;
//
const log = require('debug')('WAIBOC:responseBot') ;
//
export const responseChatbot = (argConfig,argDb,argBotManager) => {
    //
    let API_NLP = argConfig.API[process.env.AMBIENTE||'dev'] || false ;
    //
    const getAnswerFromIntent = (argMng,argDb,argIntent) => {
        return new Promise(function(respOk,respRech){
            try {
                // argDb.intents.qry({idChatbot: req.body.idAgente, entity: req.body.input.intent, campos: {idChatbot:1,answer:1,entity:1,} })
                let intentAnwer = argMng.nlp.findAllAnswers( argMng.language , argIntent ) ;
                //
                let resultAnswer = {
                    locale: argMng.language ,utterance: '',languageGuessed: false,localeIso2: 'es',language: 'Spanish',
                    nluAnswer: { classifications: [], entities: undefined, explanation: undefined },
                    classifications: [],
                    intent: argIntent ,
                    score: 1,
                    domain: 'default',
                    entities: [],
                    answers: [],
                    answer: '',
                } ;
                if ( Array.isArray(intentAnwer) && intentAnwer.length>0 ){
                    resultAnswer = Object.assign(resultAnswer,intentAnwer[0]);
                } else {
                    console.log('....intentAnwer')
                }
                //
                respOk( resultAnswer ) ;
                //
            } catch(errGI){
                console.log('....errGI: ',errGI) ;
                respRech( errGI ) ;
            }
        }) ;
    } ;
    //
    return {
        message: (req,res,next)=>{
            try {
                let answerBot        = false ;
                let chatbotAgent = {} ;
                argBotManager.get( req.body.idAgente, req.body.idConversation )
                  .then((respBotAsistente)=>{
                    chatbotAgent = respBotAsistente ;
                    if ( req.body.input.intent ){
                        return getAnswerFromIntent( chatbotAgent, argDb, req.body.input.intent ) ;
                    } else {
                        return chatbotAgent.nlp.process( chatbotAgent.language , req.body.input.text+EOF_LINE , chatbotAgent.context ) ;
                    }
                  })
                  .then((outBotAns)=>{
                    return updateBotOutput(outBotAns,chatbotAgent) ;
                  })
                  .then((resuBot)=>{
                    //
                    if ( Array.isArray(resuBot) && resuBot.length>0 ){ resuBot=resuBot[0];   } ;
                    if ( !resuBot.intent && resuBot.entity ){ resuBot.intent=resuBot.entity; } ;
                    //
                    answerBot = {...resuBot} ;
                    let tempRespuesta = {output: resuBot.answer ? {...resuBot.answer} : false }; // ( resuBot.srcAnswer ? resuBot.srcAnswer : false ) } ; //chatbotAgent.chatEvents['None']||{}
                    if ( resuBot.slotFill && resuBot.srcAnswer ){
                      tempRespuesta = {
                        output: resuBot.srcAnswer
                      } ;
                    }
                    if ( tempRespuesta.output==false ){
                        tempRespuesta.output = (chatbotAgent.nlp.chatEvents['None'] && chatbotAgent.nlp.chatEvents['None'].answer)
                                                ? chatbotAgent.nlp.chatEvents['None'].answer : {} ;
                    }
                    let tempUserNavigator = {...userNavigator} ;
                    tempUserNavigator     = Object.assign(tempUserNavigator,req.headers) ;
                    tempUserNavigator.ip  = req.ip || '' ;
                    return  argDb.conversacion.add(
                      req.body.idAgente,
                      tempUserNavigator,
                      { _id: req.body._id ? req.body._id : false, userMessage: req.body.input, answer: tempRespuesta, intent: resuBot.intent,domain: resuBot.domain },
                      chatbotAgent.context
                    ) ;
                  })
                  .then((resuAnswer)=>{
                    return res.json( resuAnswer ) ;
                  })
                  .then((resuAnswer)=>{
                    let objUpdater = { qty: 1 ,
                      idChatbot: req.body.idAgente,
                      intent: answerBot.intent||answerBot.name||answerBot.name,
                      searchText: req.body.input.text
                    };
                    return argDb.chatbot.incrementChatbotUsage( objUpdater ) ;
                  })
                  .then((resuQty)=>{
                    argBotManager.update( req.body.idAgente, req.body.idConversation, chatbotAgent.context )
                  })
                  .catch(err => {
                    console.log(err)
                    res.status(500) ;
                    res.json( err ) ;
                  });
                //
              } catch(errMsg){
                res.status(500) ;
                res.json(errMsg) ;
              }
            //
        }
    } ;
} ;
//