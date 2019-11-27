/*
*
*/
const router                    = require('express').Router()   ;
import { assistantManager }     from '../chatbot/chatbot' ;
import { userNavigator }        from 'echatbot-mongodb' ;
//
module.exports = (argConfig,argDb) => {
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
        chatbotAsistente.get( req.body.idAgente )
          .then((asistenteChatbot)=>{
            return asistenteChatbot.process( req.body.input.text ) ;
          })
          .then((resuBot)=>{
            let tempRespuesta = resuBot.answer ? {output: {...resuBot.answer}} : {output: { type: 'text', answer: ['No hay polque, no respuesta'] } } ;
            let tempUserNavigator = {...userNavigator} ;
            tempUserNavigator     = Object.assign(tempUserNavigator,req.headers) ;
            tempUserNavigator.ip  = req.ip || '' ;
            //
            return  argDb.conversacion.add(req.body.idAgente,tempUserNavigator,{
              _id: req.body._id ? req.body._id : false,
              userMessage: req.body.input,
              answer: tempRespuesta
            }) ;
          })
          .then((resuAnswer)=>{
            res.json( resuAnswer ) ;
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
              res.json(arrconversation) ;
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
    return router ;
    //
}
//