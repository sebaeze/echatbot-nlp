/*
*
*/
import React                                             from "react"         ;
import ls                                                from 'local-storage' ;
import { WidgetChatbot }                                 from "./js/componentes/WidgetChatbot" ;
import { CustomReply   }                                 from "./js/componentes/CustomReply"   ;
import { getChatbotInfo, getIdConversation, PARAMETROS } from "./js/api/api" ;
//
const validateProps = ( props ) => {
    try {
        let flagValid = {
            validProps: true,
            error: []
        } ;
        //
        if ( typeof props.idAgent=="undefined" ){
            flagValid.error.push( "Props 'idAgent' is missing" ) ;
        } ;
        //
        if ( typeof props.options=="undefined" ){
            flagValid.error.push( "Props 'options' is missing" ) ;
        } ;
        //
        return flagValid ;
    } catch(errVP){
        console.log('....errVP: ',errVP) ;
    }
} ;
//
// export { CustomReply } ;
export default class WaibocReactWidget extends React.Component {
    //
    constructor(props){
        super(props) ;
        this.state = {
            flagCached: false,
            flagValidBot: false,
            widgetVisible: true,
            idAgent: this.props.idAgent || false,
            idConversation: "",
            chatlog: [],
            options: ( this.props.options && this.props.options!=false ) ? this.props.options : {}
        } ;
        console.log('\n\nWaibocReactWidget:: Initiating') ;
    } ;
    //
    static getDerivedStateFromProps(newProps,state){
        //
        if ( newProps.options!=false && JSON.stringify(newProps.options)!=JSON.stringify(state.options) || newProps.idAgent!=state.idAgent ){
            let newState = { idAgent: newProps.idAgent } ;
            if ( newProps.options!=false ){
                newState.options = newProps.options || {} ;
                if ( !newState.options.training  ){ newState.options.training=false; }
            }
            let resultValidation = validateProps( newProps );
            if ( resultValidation.validProps==true ){
                console.log('.....derived:: newState: ',newState) ;
                return newState ;
            } else {
                console.log('...resultValidation: ',resultValidation) ;
                this.setState({ flagCached: true, flagValidBot: false }) ;
            }
        } else {
            return false ;
        }
        //
    } ;
    //
    componentDidMount(){
        try {
            //
            let resultValidation = validateProps( this.props );
            if ( resultValidation.validProps==true ){
                //
                getIdConversation(false, this.state.options.training)
                    .then((respIdConversation)=>{
                        return getChatbotInfo( {idChatbot: this.state.idAgent, idConversation: respIdConversation.id} ) ;
                    })
                    .then((respData)=>{
                        //
                        let newState = {
                            flagCached: true,
                            flagValidBot: false,
                            idConversation: respData.result.idConversation || false,
                            chatlog: respData.result.chatlog || [] ,
                            options: this.state.options || false
                        } ;
                        //
                        if ( respData.result.resultCode==PARAMETROS.RESULT_CODES.OK ){
                            //
                            newState.flagValidBot    = true ;
                            newState.options.options = respData.result.options ? {...respData.result.options} : {...respData.result} ;
                            // Sobreescribe valores de configuracion en DB, por valores indicados localmente
                            if ( this.props.options && this.props.options!=false ){
                                for ( let keyConf in this.props.options ){
                                    let valConf = this.props.options[keyConf] ;
                                    if ( valConf && String(valConf).length>0 ){
                                        newState.options[keyConf] = valConf ;
                                    }
                                }
                            }
                            //
                            ls( PARAMETROS.SESSION.ID_CONVERSATION, respData.result.idConversation ) ;
                            this.setState( newState ) ;
                            //
                        } else {
                            console.log('....CHATBOT IS NOT VALID ---> ',respData.result.error) ;
                            this.setState({ flagCached: true, flagValidBot: false }) ;
                        }
                    })
                    .catch((respErr)=>{
                        console.dir(respErr) ;
                        this.setState({ flagCached: true, flagValidBot: false }) ;
                    }) ;
                //
            } else {
                console.log('...resultValidation: ',resultValidation) ;
                this.setState({ flagCached: true, flagValidBot: false }) ;
            }
            //
        } catch(errDM){
            console.log('.....ERROR: ',errDM) ;
            this.setState({ flagCached: true, flagValidBot: false }) ;
        }
    }
    //
    render () {
        //
        let outRender = ( this.state.flagCached==true && this.state.flagValidBot==true )
                        ?   <WidgetChatbot
                                configuration={{idAgent: this.state.idAgent,options: this.state.options}}
                                widgetVisible={this.state.widgetVisible}
                                onWindowOpen={this.props.onWindowOpen   ? this.props.onWindowOpen : ()=>{console.log('....windowOpen')}}
                                onWindowClose={this.props.onWindowClose ? this.props.onWindowClose : ()=>{console.log('....windowClose')}}
                                conversation={{idConversation: this.state.idConversation,chatlog: this.state.chatlog}}
                            />
                        :   <div></div> ;
        //
        return ( outRender ) ;
        //
    }
    //
}
//