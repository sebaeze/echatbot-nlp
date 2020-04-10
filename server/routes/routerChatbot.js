/*
*
*/
const router                    = require('express').Router()   ;
import { userNavigator }        from 'echatbot-mongodb' ;
import { assistantManager, validateChatbotAgent }     from '../chatbot/chatbot' ;
//
module.exports = (argConfig,argDb) => {
    //
    let API_NLP = argConfig.API[process.env.AMBIENTE||'dev'] || false ;
    //
    const chatbotAsistente = assistantManager(argDb) ;
    router.all('/:seccion', function(req,res,next){
        /*
        *  Este paso funciona para que la comunicacion entre front -> backend no falle por error de CORS
        */
        res.set('access-Control-Allow-Origin'  , '*');
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'content-type');
        res.setHeader("Access-Control-Allow-Credentials", true);
        //
        next() ;
        //
    }) ;
    //
    router.post('/mensaje', function(req,res){
      try {
        //
        res.set('access-Control-Allow-Origin'  , '*');
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'content-type');
        res.setHeader("Access-Control-Allow-Credentials", true);
        //
        let answerBot = false ;
        chatbotAsistente.get( req.body.idAgente )
          .then((asistenteChatbot)=>{
            return asistenteChatbot.process( req.body.input.text ) ;
          })
          .then((resuBot)=>{
            if ( process.env.AMBIENTE!='produccion' ){
              console.log('.....resuBot:: ',resuBot) ;
            }
            //
            answerBot = {...resuBot} ;
            let tempRespuesta     = resuBot.answer ? {output: {...resuBot.answer}} : {output: { type: 'text', answer: ['No hay polque, no respuesta'] } } ;
            let tempUserNavigator = {...userNavigator} ;
            tempUserNavigator     = Object.assign(tempUserNavigator,req.headers) ;
            tempUserNavigator.ip  = req.ip || '' ;
            return  argDb.conversacion.add(
              req.body.idAgente,
              tempUserNavigator,
              { _id: req.body._id ? req.body._id : false, userMessage: req.body.input, answer: tempRespuesta, intent: resuBot.intent,domain: resuBot.domain }
            ) ;
          })
          .then((resuAnswer)=>{
            res.json( resuAnswer ) ;
          })
          .then((resuAnswer)=>{
            let usageEntity = {} ;
            if ( String(answerBot.intent).toUpperCase()!="NONE" ){
              usageEntity = {
                entity: {
                  qty: 1,
                  name: answerBot.intent
                }
              } ;
            }
            return argDb.chatbot.incrementChatbotUsage( { _id: req.body.idAgente,qty: 1, ...usageEntity } ) ;
          })
          .then((resuQty)=>{
            /* */
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
    }) ;
    //
    router.post('/retrain', function(req,res){
      try {
        //
        res.set('access-Control-Allow-Origin'  , '*');
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'content-type');
        res.setHeader("Access-Control-Allow-Credentials", true);
        //
        if ( API_NLP.NLP_TRAIN_SECRET==req.body.secretAPInlp ){
          console.log('....reTrain de id: ',req.body.idAgente) ;
          chatbotAsistente.get( req.body.idAgente, true )
          .then((asistenteChatbot)=>{
            res.json({
              code: 0,
              result: {
                msg: 'train ok'
              }
            }) ;
          })
          .catch(err => {
            console.log(err)
            res.status(500) ;
            res.json({
                code: 500,
                result: {
                  msg: 'Error during training',
                  error: err
                }
            }) ;
          });
        } else {
          res.status(401) ;
            res.json({
                code: 401,
                result: {
                  msg: 'Request is not authorized to re-training the bot. Bad Secret API key.',
                  error: 'Request is not authorized to re-training the bot. Bad Secret API key.'
                }
            }) ;
        }
        //
      } catch(errMsg){
        res.status(500) ;
        res.json(errMsg) ;
      }
    }) ;
    //
    router.get('/chatlog', function(req,res){
      try {
        //
        res.set('access-Control-Allow-Origin'  , '*');
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'content-type');
        res.setHeader("Access-Control-Allow-Credentials", true);
        //
        argDb.conversacion.qry( req.query )
            .then((arrconversation)=>{
              res.json({
                status:0,
                result: arrconversation
              }) ;
            })
            .catch((errConv)=>{
              res.status(500) ;
              res.json(errConv) ;
            }) ;
        //
      } catch(errMsg){
        res.status(500) ;
        res.json(errMsg) ;
      }
    }) ;
    //
    router.get('/session', function(req,res){
      try {
        //
        res.set('access-Control-Allow-Origin'  , '*');
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'content-type');
        res.setHeader("Access-Control-Allow-Credentials", true);
        //
        validateChatbotAgent( argDb, req )
            .then((respCB)=>{
              res.status(200) ;
              res.json({
                status: respCB.resultCode,
                resultCode: respCB.resultCode,
                result: respCB
              }) ;
            })
            .catch((respErr)=>{
              res.status(500) ;
              res.json(respErr) ;
            }) ;
        //
      } catch(errMsg){
        res.status(500) ;
        res.json(errMsg) ;
      }
    }) ;
    //
    return router ;
    //
}
//