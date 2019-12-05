/*
*
*/
import React                              from "react"      ;
import ReactDOM                           from "react-dom"  ;
import WidgetChatbot                      from "./js/componentes/WidgetChatbot" ;
import ls                                                from 'local-storage'    ;
import { getChatbotInfo, getIdConversation, PARAMETROS } from "./js/api/api" ;
//
const initChatbotWidget = (argConfigBot) => {
  try {
    //
    let idDiv  = "idWidgetChatbot"+new Date().getTime() ;
    console.log('\n\n.....Iniciando widget eChatbot. Id: '+argConfigBot.idAgent+' ==> ') ;
    //
    let divApp = document.getElementById( idDiv ) || false ;
    if ( !divApp ){
      divApp    = document.createElement('div') ;
      divApp.id = idDiv ;
      document.body.appendChild( divApp ) ;
    }
    //
    getIdConversation(false)
      .then((respIdConversation)=>{
        return getChatbotInfo( {idChatbot: argConfigBot.idAgent, idConversation: respIdConversation.id} ) ;
      })
      .then((respData)=>{
        if ( respData.result.validation==PARAMETROS.CHATBOT_STATUS.ACTIVE ){
          let tempConfig = {...respData.result} ;
          // Sobreescribe valores de configuracion en DB, por valores indicados localmente
          for ( let keyConf in argConfigBot ){
            let valConf = argConfigBot[keyConf] ;
            if ( valConf && String(valConf).length>0 ){
              tempConfig[keyConf] = valConf ;
            }
          }
          //
          ls( PARAMETROS.SESSION.ID_CONVERSATION, respData.result.idConversation ) ;
          ReactDOM.render( <WidgetChatbot configuration={tempConfig} conversation={{idConversation: respData.result.idConversation,chatlog: respData.result.chatlog}} />, divApp ) ;
          //
        } else {
          console.log('....CHATBOT IS NOT VALID ---> "'+respData.result.validation+'"') ;
        }
      })
      .catch((respErr)=>{
        console.dir(respErr) ;
      }) ;
    //
  } catch(errICB){
    console.dir(errICB) ;
  }
} ;
//
window.initChatbotWidget = initChatbotWidget ;
//