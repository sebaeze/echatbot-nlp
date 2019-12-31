/*
*
*/
import React, { Component }                                      from 'react'  ;
import { Widget, addResponseMessage, renderCustomComponent, toggleMsgLoader, addUserMessage, toggleWidget }     from 'react-chat-widget'  ;
import { CustomReply  }                                          from './CustomReply'       ;
import { fetchChatbot }                                          from '../api/api' ;
//
import 'react-chat-widget/lib/styles.css' ;
import '../../css/estiloChat.css' ;
//
export class WidgetChatbot extends Component {
  constructor(props) {
    super(props) ;
    const { options }  = this.props.configuration ;
    this.state                 = {
      pendientes: 1,
      chatOpen: false,
      prevWidgetVisible: true,
      widgetVisible: true ,
      idConversation: this.props.conversation.idConversation,
      options: options ? {...options} : {botName: '',botSubtitle: '',senderPlaceholder: ''}
    } ;
    this.handleNewUserMessage  = this.handleNewUserMessage.bind(this) ;
    this.onClickOpcion         = this.onClickOpcion.bind(this) ;
    this.chatOpenedHandler     = this.chatOpenedHandler.bind(this) ;
    this.chatClosedHandler     = this.chatClosedHandler.bind(this) ;
    this.mensajePrevio         = { input: { text: "" } } ;
  }
  //
  componentDidMount(){
    try {
      //
      if ( this.props.conversation.chatlog.length==0 ){
        this.handleNewUserMessage( 'WELCOME.INITIAL' ) ;
      } else {
        toggleMsgLoader();
        let tempChatlog = this.props.conversation.chatlog.sort( (a,b)=>{ return a.ts.localeCompare(b.ts); }) ;
        for (let icl=0; icl<tempChatlog.length; icl++){
          let objConv = tempChatlog[icl] ;
          if ( objConv.intent  && String(objConv.intent).length>0 ){
            if ( objConv.userMessage && objConv.userMessage.text && String(objConv.userMessage.text)!="undefined" && objConv.userMessage.text!=objConv.intent ){
              addUserMessage( String(objConv.userMessage.text) ) ;
            }
            renderCustomComponent( CustomReply.bind(this) ,
                                {
                                  datos: objConv.answer ,
                                  timestamp: objConv.ts,
                                  onClickOpcion:this.onClickOpcion.bind(this),
                                  addMsg: addResponseMessage.bind(this) ,
                                  windowStyle: this.props.configuration.windowStyle,
                                  onOpen: this.chatOpenedHandler ,
                                  onClose: this.chatClosedHandler
                                }, false ) ;
          }
        }
        toggleMsgLoader() ;
      }
      //
    } catch(errDM){
      console.dir(errDM) ;
    }
  }
  //
  chatOpenedHandler(){
    if ( this.state.chatOpen!=true ){
      this.props.onWindowOpen() ;
      this.setState({chatOpen: true, pendientes: 0}) ;
    }
  }
  //
  chatClosedHandler(){
    if ( this.state.chatOpen!=false ){
      this.props.onWindowClose() ;
      this.setState({chatOpen: false}) ;
    }
  }
  //
  onClickOpcion(argTextSearch){
    try {
      //
      if ( argTextSearch && argTextSearch.length>0 ){
        this.handleNewUserMessage( argTextSearch ) ;
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
  }
  //
  static getDerivedStateFromProps(newProps, state) {
    let newStateProps = {} ;
    if ( newProps.widgetVisible!=state.widgetVisible ){
      newStateProps["prevWidgetVisible"] = state.widgetVisible ;
      newStateProps["widgetVisible"]     = newProps.widgetVisible ;
    }
    if ( newProps.options && JSON.stringify(newProps.options)!=JSON.stringify(state.options) ){
      newStateProps["options"] = newProps.options ;
    }
    if ( Object.keys(newStateProps).length>0 ){
      return { newStateProps } ;
    } else {
      return false ;
    }
  }
  //
  render() {
    //
    return (
      <div id="WaibocWidgetMain" >
          <Widget
            handleNewUserMessage={this.handleNewUserMessage}
            title={this.state.options.botName}
            subtitle={this.state.options.botSubtitle}
            senderPlaceHolder={this.state.options.senderPlaceholder}
            showCloseButton={true}
            badge={this.state.pendientes}
            autofocus={true}
          />
      </div>
      )
      //
  }
}
//