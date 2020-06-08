/*
*
*/
const router                                          = require('express').Router()   ;
import { assistantManager, validateChatbotAgent }     from '../chatbot/chatbot' ;
import { responseChatbot }                            from './responses/responseChatbot'  ;
//
module.exports = (argConfig,argDb) => {
    //
    let API_NLP = argConfig.API[process.env.AMBIENTE||'dev'] || false ;
    //
    const chatbotAsistente = assistantManager(argDb) ;
    const respBot          = responseChatbot(argConfig,argDb,chatbotAsistente) ;
    //
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
    router.post( '/mensaje' , respBot.message ) ;
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
          chatbotAsistente.get( req.body.idAgente, false ,true )
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