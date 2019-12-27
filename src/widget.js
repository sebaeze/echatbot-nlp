/*
*
*/
import React                                             from "react"         ;
import ReactDOM                                          from "react-dom"     ;
import ls                                                from 'local-storage' ;
import WidgetChatbot                                     from "./js/componentes/WidgetChatbot" ;
import { CustomReply  }                                  from "./js/componentes/CustomReply"   ;
import { getChatbotInfo, getIdConversation, PARAMETROS } from "./js/api/api" ;
//
const domNodeWidget = () => {
  let outDiv ;
  try {
    let idDiv  = "waiboc-chatbot-widget-"+new Date().getTime() ;
    outDiv = document.getElementById( idDiv ) || false ;
    if ( !outDiv ){
      outDiv    = document.createElement('div') ;
      outDiv.id = idDiv ;
      document.body.appendChild( outDiv ) ;
    }
  } catch(errDnW){
    console.log('....ERROR: Create DOM node for widget:: ',errDnW) ;
  }
  return outDiv ;
}
//
const initChatbotWidget = (argConfigBot) => {
  try {
    //
    console.log('\n\n.....Iniciando widget eChatbot. Id: '+argConfigBot.idAgent+' ==> ') ;
    if ( !argConfigBot.training ){ argConfigBot.training=false; }
    //
    getIdConversation(false, argConfigBot.training)
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
          //
          if ( typeof argConfigBot.onWindowOpen !="function" ){ argConfigBot.onWindowOpen  = function(){} }
          if ( typeof argConfigBot.onWindowClose!="function" ){ argConfigBot.onWindowClose = function(){} }
          //
          let divApp = domNodeWidget() ;
          ReactDOM.render(
                      <WidgetChatbot
                          configuration={tempConfig}
                          onWindowOpen={argConfigBot.onWindowOpen}
                          onWindowClose={argConfigBot.onWindowClose}
                          conversation={{idConversation: respData.result.idConversation,chatlog: respData.result.chatlog}}
                      />,
                      divApp
                    ) ;
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
window.waiboc = {
  initChatbotWidget: initChatbotWidget ,
  CustomReply: CustomReply
} ;
//