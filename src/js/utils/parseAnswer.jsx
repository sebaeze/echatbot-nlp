/*
*
*/
import React                                   from 'react' ;
import { Button, Icon }                        from 'antd'  ;
import { ImageLoader }                         from '../componentes/image/ImageLoader'   ;
import { TableDynamic }                        from '../componentes/table/TableDynamic'  ;
import { MessageCarousel }                     from '../componentes/messages/MessageCarousel' ;
//
const parseText     = (argAnswer,tempStyle,argKey) => {
    let outDiv = false ;
    try {
        let tempText     = (argAnswer.text ? argAnswer.text : argAnswer.answer) || [""] ; ;
        let arrayAnswers = Array.isArray(tempText)==true ? tempText : new Array( tempText ) ;
        //
        outDiv = <p style={{...tempStyle,marginBottom:'0'}} key={argKey} >
            {
                arrayAnswers.map((eleTT,idxTT)=>{
                    return( <span key={idxTT} style={{whiteSpace: 'pre-wrap'}}  >{eleTT}</span>)
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
const parseFiles    = (argAnswer, argKey) => {
    let outEle = null ;
    try {
        if ( argAnswer.files && argAnswer.files.length>0 ){
            outEle = <div key={argKey+"_files"}>
                {
                    argAnswer.files.map((elemFile, elemIdx)=>{
                        let outfile = null ;
                        if ( elemFile.type.indexOf('image')!=-1 ){
                            outfile = <ImageLoader  key={elemIdx}
                                                    src={elemFile.relativePath}
                                                    altImg={elemFile.alt ? elemFile.alt : ""}
                                                    className="" loadingClassName="loading" loadedClassName=""
                                                    customStyle={{img:{marginTop:'10px'}}}
                                                    title={elemFile.name}
                                                    alt={elemFile.name}
                                        />
                        } else {
                            let styleFile = {color:'green', fontSize:'32px',marginRight:'20px', marginTop:'10px'} ;
                            let iconFile  = <Icon type="file" style={styleFile} /> ;
                            switch( String(elemFile.type).trim() ){
                                case 'application/vnd.ms-excel':       iconFile  = <Icon type="file-excel" style={styleFile} /> ; break ;
                                case 'application/pdf':                iconFile  = <Icon type="file-pdf"   style={styleFile} /> ; break ;
                                case 'application/vnd.ms-powerpoint':  iconFile  = <Icon type="file-ppt"   style={styleFile} /> ; break ;
                                case 'application/zip':                iconFile  = <Icon type="file-zip"   style={styleFile} /> ; break ;
                                case 'video/mp4':
                                    iconFile = <video loop="" autoplay="" muted="" style={{marginTop:'10px',minHeight:'30vh' }} >
                                                    <source src={elemFile.relativePath} type="video/mp4" />
                                                </video> ;
                                break ;
                                default:
                                    console.log('....formato desconocido de archivo:: type: '+String(elemFile.type).trim()+' objeto: ',elemFile) ;
                                break ;
                            }
                            outfile = <div key={elemIdx}>
                                        <a href={elemFile.relativePath} target="_blank" >
                                            {iconFile}
                                            <span style={{marginLeft:'10px', fontSize:'20px'}} >
                                                {elemFile.name}
                                            </span>
                                        </a>
                                    </div> ;
                        }
                        return outfile ;
                    })
                }
            </div> ;
        }
    } catch(errPI){
        console.dir(errPI) ;
        throw errPI ;
    }
    return outEle ;
}
const parseImage    = (argAnswer,tempStyle) => {
    let outEle = false ;
    try {
        let customAlt = argAnswer.alt ? argAnswer.alt : "" ;
        outEle = <ImageLoader src={argAnswer.source}
                              altImg={customAlt}
                              className="" loadingClassName="loading" loadedClassName=""
                              customStyle={{...tempStyle}}
                              title={argAnswer.title}
                              alt={argAnswer.description}
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
    files: parseFiles ,
    image: parseImage ,
    json: parseJson ,
    option: parseOption ,
    carousel: parseCarousel
}
//
export const parseAnswer = (argAnswer, argStyle={}) => {
    try {
        let arrayOut     = [] ;
        let arrayAnswers = Array.isArray(argAnswer) ? argAnswer : new Array(argAnswer);
        for ( let indArr=0; indArr<arrayAnswers.length; indArr++ ){
            let answerElem = arrayAnswers[ indArr ] ;
            let parser    = allParsers[ answerElem.type ] || false ;
            if ( parser==false ){
                throw new Error('ERROR: Answer type "'+answerElem.type+'" is unknown. Answer:: '+JSON.stringify(answerElem)) ;
            }
            //
            arrayOut.push(
                <div key={indArr} >
                    { parser( answerElem, argStyle,indArr ) }
                    { parseFiles( answerElem, indArr ) }
                </div>
            ) ;
            //
        }
        return arrayOut ;
    } catch(errPA){
        console.dir(errPA) ;
        throw errPA ;
    }
}