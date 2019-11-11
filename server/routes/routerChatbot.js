/*
*
*/
const router                    = require('express').Router()   ;
import { assistantManager }     from '../chatbot/chatbot' ;
//
module.exports = (argConfig,argDb) => {
    //
    const chatbotAsistente = assistantManager(argDb) ;
    router.all('/mensaje', function(req,res,next){
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
        chatbotAsistente.get( req.body.idAgente )
          .then((asistenteChatbot)=>{
            return asistenteChatbot.process( req.body.input.text ) ;
          })
          .then((resuBot)=>{
            let tempRespuesta = resuBot.answer ? {output: {...resuBot.answer}} : {output: { type: 'text', answer: ['No hay polque, no respuesta'] } } ;
            res.json( tempRespuesta ) ;
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
    return router ;
    //
}
//