/*
*
*/
//
const dbConnClass    = require('./db').classDb ;
const dbChatbots     = require('./dbChatbots').classDb ;
const dbConversation = require('./dbConversation').classDb ;
const dbEstadisticas = require('./dbEstadisticas').classDb ;
const dbUsuarios     = require('./dbUsuarios').classDb ;
//
module.exports.bases = (argConfig) => {
    //
    const dbConn         = new dbConnClass( argConfig ) ;
    return {
        chatbot: new dbChatbots(dbConn) ,
        conversacion: new dbConversation(dbConn) ,
        estadisticas: new dbEstadisticas(dbConn) ,
        usuarios: new dbUsuarios(dbConn)
    }
} ;
//
