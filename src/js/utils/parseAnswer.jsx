/*
*
*/
import React                                   from 'react' ;
import { Button, Icon }                        from 'antd'  ;
import { ImageLoader }                         from '../componentes/image/ImageLoader'   ;
import { TableDynamic }                        from '../componentes/table/TableDynamic'  ;
import { MessageCarousel }                     from '../componentes/messages/MessageCarousel' ;
//
const parseText     = (argAnswer,tempStyle) => {
    let outDiv = false ;
    try {
        let tempText     = (argAnswer.text ? argAnswer.text : argAnswer.answer) || [""] ; ;
        let arrayAnswers = Array.isArray(tempText)==true ? tempText : new Array( tempText ) ;
        //
        outDiv = <p style={{...tempStyle,marginBottom:'0'}}>
            {
                arrayAnswers.map((eleTT,idxTT)=>{
                    return( <span key={idxTT}>{eleTT}</span>)
                })
            }
        </p>  ;
        //
    } catch(errPT){
        console.dir(errPT) ;
        throw errPT ;
    }
    return outDiv ;
}
const parseImage    = (argAnswer,tempStyle) => {
    let outEle = false ;
    try {
        //let custStyle = elemOpt.customStyle ? elemOpt.customStyle : {paddingLeft:'10%',width:'250px',height:'auto'} ;
        let customAlt = argAnswer.alt ? argAnswer.alt : "" ;
        outEle = <ImageLoader src={argAnswer.source}
                              altImg={customAlt}
                              className="" loadingClassName="loading" loadedClassName=""
                              customStyle={{...tempStyle}}
                              title={elemOpt.title}
                              alt={elemOpt.description}
                /> ;
    } catch(errPI){
        console.dir(errPI) ;
        throw errPI ;
    }
    return outEle ;
}
const parseJson     = (argAnswer) => {
    let outEle = false ;
    try {
        outEle = <div style={{marginTop:'5px'}}><TableDynamic jsonData={argAnswer} /></div> ;
    } catch(errPI){
        console.dir(errPI) ;
        throw errPI ;
    }
    return outEle ;
}
const parseOption   = (argAnswer,tempStyle) => {
    let outEle = false ;
    try {
        outEle =    <div >
                        <span>{<ReactRenderDynamic text={argAnswer.title} />}</span>
                        {
                            argAnswer.options.map((elemInner, elemIdx)=>{
                                return (
                                    <Button key={elemIdx} style={{marginTop:'5px'}} block
                                            onClick={ (argEE)=>{ argEE.preventDefault();this.props.onClickOpcion(elemInner.value);} }
                                    >
                                        {elemInner.label
                                    }</Button>
                                )
                            })
                        }
                    </div> ;
    } catch(errPI){
        console.dir(errPI) ;
        throw errPI ;
    }
    return outEle ;
}
const parseCarousel = (argAnswer) => {
    let outEle = false ;
    try {
        outEle = <MessageCarousel  message={argAnswer} /> ;
    } catch(errPI){
        console.dir(errPI) ;
        throw errPI ;
    }
    return outEle ;
}
//
const allParsers = {
    text: parseText ,
    image: parseImage ,
    json: parseJson ,
    option: parseOption ,
    carousel: parseCarousel
}
//
export const parseAnswer = (argAnswer, argStyle={}) => {
    try {
        let parser = allParsers[ argAnswer.type ] || false ;
        if ( parser==false ){
            throw new Error('ERROR: Answer type "'+argAnswer.type+'" is unknown. Answer:: '+JSON.stringify(argAnswer)) ;
        }
        return parser( argAnswer, argStyle ) ;
    } catch(errPA){
        console.dir(errPA) ;
        throw errPA ;
    }
}