/*
*
*/
import React, { Component }                                      from 'react'  ;
import { Widget, addResponseMessage, renderCustomComponent, toggleMsgLoader }     from 'react-chat-widget'  ;
import { CustomReply  }                                          from './CustomReply'       ;
import { fetchChatbot, getIdConversation }                       from '../api/api' ;
//
import 'react-chat-widget/lib/styles.css' ;
import '../../css/estiloChat.css' ;
//
class WidgetChatbot extends Component {
  constructor(props) {
    super(props) ;
    this.state                 = {pendientes: 1, chatOpen: false, idConversation: false } ;
    this.handleNewUserMessage  = this.handleNewUserMessage.bind(this) ;
    this.onClickOpcion         = this.onClickOpcion.bind(this) ;
    this.chatOpenedHandler     = this.chatOpenedHandler.bind(this) ;
    this.chatClosedHandler     = this.chatClosedHandler.bind(this) ;
    this.mensajePrevio         = { input: { text: "" } } ;
    // this.idConversation        = false ;
  }
  //
  componentDidMount(){
    try {
      toggleMsgLoader();
      //
      if ( this.state.idConversation==false ){
        getIdConversation()
          .then((respId)=>{
            this.setState({idConversation: respId.id }) ;
          })
          .catch((respErr)=>{
            console.log('....error en buscar id:: ') ;
            console.dir(respErr) ;
          }) ;

      }
      //
      setTimeout(() => {
        renderCustomComponent( CustomReply.bind(this) ,
                {
                  datos: {output:{type:'text',answer:'Hola !'}} ,
                  onClickOpcion:this.onClickOpcion.bind(this),
                  addMsg:addResponseMessage.bind(this) ,
                  windowStyle: this.props.configuration.windowStyle,
                  onOpen: this.chatOpenedHandler ,
                  onClose: this.chatClosedHandler
                },
                false ) ;
          toggleMsgLoader();
      }, 1500)
      //
    } catch(errDM){
      console.dir(errDM) ;
    }
  }
  //
  chatOpenedHandler(){
    console.log("opened") ;
    if ( this.state.chatOpen!=true ){
      this.setState({chatOpen: true, pendientes: 0}) ;
    }
  }
  //
  chatClosedHandler(){
    console.log("clossed") ;
    if ( this.state.chatOpen!=false ){
      this.setState({chatOpen: false}) ;
    }
  }
  //
  onClickOpcion(argEvent){
    try {
      argEvent.preventDefault() ;
      let valueSelected = argEvent.target.getAttribute('valueselected') || false ;
      console.dir(valueSelected) ;
      //
      if ( valueSelected ){
        /*
        api.chatbotMessage( valueSelected, this.props.idAgente )
            .then((respBotParsed)=>{
              renderCustomComponent( CustomReply.bind(this) , {tipo:'tabla',datos: respBotParsed, onClickOpcion:this.onClickOpcion.bind(this) }, false ) ;
            })
            .catch((errBot)=>{
              console.dir(errBot) ;
            }) ;
            */
      }
      //
    } catch(errOCO){
      console.dir(errOCO) ;
    }
  }
  //
  handleNewUserMessage(newMessage){
    /*
    *   __URL_BACKEND__: Es generada por webpack en momento del Build
    */
    toggleMsgLoader();
    fetchChatbot({idAgente: this.props.configuration.idAgent,_id: this.state.idConversation,input:{text:newMessage} })
      .then((respBot)=>{
        /*
          if ( respBot._id ){
            if ( this.state.idConversation==false ){

            }
            this.idConversation = respBot._id ;
          } else {
            console.log('****ERROR: Falta _id en respuesta: ') ;
            console.dir(respBot) ;
          }
          */
          renderCustomComponent( CustomReply.bind(this) ,
                    {
                      datos: respBot ,
                      onClickOpcion:this.onClickOpcion.bind(this) ,
                      windowStyle: this.props.configuration.windowStyle,
                      addMsg:addResponseMessage.bind(this) ,
                      onOpen: this.chatOpenedHandler ,
                      onClose: this.chatClosedHandler
                    }, false ) ;
          toggleMsgLoader();
      })
      .catch((errBot)=>{
        console.log('....errBot: ') ;
        console.dir(errBot) ;
        toggleMsgLoader();
      }) ;
    //
    /*
    let tempUrlBackend = __URL_BACKEND__+'/chatbot/mensaje?idAgente='+this.props.idAgente ;
    console.log('...tempUrlBackend: '+tempUrlBackend+';') ;
    fetch( tempUrlBackend ,postOpt)
            .then(function(response){
                if (response.status>=200 & response.status<=400) {
                    return response.json() ;
                } else {
                    throw new Error("ERROR: ADD Productos nuevos. Http Status: "+response.status+'.') ;
                }
            }.bind(this))
            .then(function(respNlp   ){
              renderCustomComponent( CustomReply.bind(this) , {datos: respNlp, onClickOpcion:this.onClickOpcion.bind(this) }, false ) ;
            }.bind(this))
            .catch((respRechaz ) => { console.dir(respRechaz) ; }) ;
            */
    //
  }
  //
  render() {
    //
    const { defaultStyle }  = this.props.configuration ;
    let tempDefaultstyle    = defaultStyle ? defaultStyle : {} ;
    tempDefaultstyle = {
      ...tempDefaultstyle,
      '& .rcwConversationContainer .rcwHeader':{
        backgroundColor: 'red'
      }
    } ;
    //
    return (
      <div id="idWrapperWidget" style={{...tempDefaultstyle}} >
          <Widget
            handleNewUserMessage={this.handleNewUserMessage}
            title="Soporte"
            subtitle="En linea"
            senderPlaceHolder="Escribe un mensaje"
            showCloseButton={true}
            badge={this.state.pendientes}
          />
      </div>
      )
      //
    }
  }
/* */
export default WidgetChatbot ;
/* */