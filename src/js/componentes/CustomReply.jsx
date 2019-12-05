/*
*
*/
import React                                   from 'react' ;
import { Button, Spin, Icon, Carousel }        from 'antd'  ;
import jstz                                    from '../libs/jstz.min.js'
import moment                                  from 'moment-timezone';
import { TableDynamic }              from './table/TableDynamic'  ;
import { ImageLoader }               from './image/ImageLoader'   ;
import { DivMessage  }               from './messages/DivMessage' ;
import { MessageCarousel }           from './messages/MessageCarousel' ;
//
import 'antd/dist/antd.css';
const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
//
export class CustomReply extends React.Component {
    constructor(props){
        super(props) ;
        this.state          = { flagMount: false, answerAssistant: this.props.datos.answer ? this.props.datos.answer.output : this.props.datos.output } ;
        this.wrapAnswer     = this.wrapAnswer.bind(this) ;
        this.apiUrlFromText = this.apiUrlFromText.bind(this) ;
    } ;
    //
    componentDidMount(){
        try {
            this.props.onOpen() ;
            this.setState({flagMount:true}) ;
        } catch(errDM){
            console.dir(errDM) ;
        }
    }
    //
    componentWillUnmount() {
        this.props.onClose()
    }
    //
    apiUrlFromText(argText){
        let outUrl = "" ;
        try {
            outUrl      = argText.trim().split("*API={") ;
            outUrl     = outUrl[1].trim().split('}');
            outUrl     = outUrl[0];
            if ( outUrl.indexOf('$')!=-1 ){
                outUrl     = outUrl.trim().split('$');
            outUrl     = outUrl[0];
            }
        } catch(errapiUrl){
            console.dir(errapiUrl) ;
            throw errapiUrl ;
        }
        return outUrl ;
    }
    //
    wrapAnswer(elemOpt){
        try {
            //
            let tempStyleMsg = {backgroundColor: '#E0E6E5',borderRadius: '10px',padding: '15px' } ;
            const { messageResponseStyle, timestamp } = this.props ;
            let tempStyle = messageResponseStyle ? messageResponseStyle : {} ;
            //let tempTs    = timestamp ? timestamp : new Date().toISOString() ;
            // jstz.determine().name()
            let tempTs    = timestamp ? timestamp : moment( new Date() ).tz(jstz.determine().name()).format() ;
            tempTs        = String(tempTs).substr(0,18).replace(/([Tt])/g,'') ;
            //
            let outEle ;
            switch( elemOpt.type ){
                case 'text':
                    outEle=<p style={{...tempStyle,marginBottom:'0'}}>{elemOpt.answer}</p> ;
                break ;
                case 'image':
                    let custStyle = elemOpt.customStyle ? elemOpt.customStyle : {paddingLeft:'10%',width:'250px',height:'auto'} ;
                    let customAlt = elemOpt.alt ? elemOpt.alt : "" ;
                    outEle = <ImageLoader src={elemOpt.source} altImg={customAlt} className="" loadingClassName="loading" loadedClassName="" customStyle={{...tempStyle}} title={elemOpt.title} alt={elemOpt.description} /> ;
                break ;
                case 'json':
                    //
                    outEle = <div style={{marginTop:'5px'}}><TableDynamic jsonData={elemOpt} /></div> ;
                    //
                break ;
                case 'option':
                    outEle =
                    <div >
                        <span>{<ReactRenderDynamic text={elemOpt.title} />}</span>
                        {
                            elemOpt.options.map((elemInner, elemIdx)=>{
                                return (
                                    <Button key={elemIdx} style={{marginTop:'5px'}} block
                                            onClick={ (argEE)=>{ argEE.preventDefault();this.props.onClickOpcion(elemInner.value);} }
                                    >{elemInner.label}</Button>
                                )
                            })
                        }
                    </div> ;
                break ;
                case 'carousel':
                    outEle = <MessageCarousel  message={elemOpt} /> ;
                break ;
                default:
                    console.log('\n\n **** ERROR: response_type desconocido: '+elemOpt.response_type+';') ;
                    throw new Error('response_type desconocido: '+elemOpt.response_type) ;
                break ;
            }
            //  return( <DivMessage refLastM={this.refLastMsg} >{ outEle }</DivMessage> ) ;
            return(
                <DivMessage>
                    <p style={{width:'100%',textAlign:'center'}}>{tempTs}</p>
                    <div style={{...tempStyleMsg}}>{ outEle }</div>
                </DivMessage>
                ) ;
            //
        } catch(errTS){
            console.dir(errTS) ;
        }
    }
    //
    render(){
        //
        let outDiv = this.wrapAnswer( this.state.answerAssistant ) ;
        return( this.state.flagMount==false ? <Spin indicator={antIcon} /> : outDiv ) ;
        //
    }
    //
} ;
//