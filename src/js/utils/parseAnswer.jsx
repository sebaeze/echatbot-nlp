/*
*
*/
import React, { userState }                    from 'react' ;
import { Button, Icon, Tag }                   from 'antd'  ;
import { ImageLoader }                         from '../componentes/image/ImageLoader'   ;
import { TableDynamic }                        from '../componentes/table/TableDynamic'  ;
import { MessageCarousel }                     from '../componentes/messages/MessageCarousel' ;
//
const ReactRenderDynamic = (argProps) => {
    const subs = /(^.*)(\$(.*))/.exec(argProps.text);
    // console.log('....subs: ',subs) ;
    let tempText = String(argProps.text).replace(/\n/g, "<br />") ;
    /*
    return(
        <div>
            {tempText}
        </div>
    ) ;
    */
    return( <div dangerouslySetInnerHTML={{__html: tempText}}></div> ) ;
} ;
//
const parseText     = (argAnswer,tempStyle,argKey,argOnClickOpcion, argToggleInput) => {
    let outDiv = false ;
    try {
        let tempText     = (argAnswer.text ? argAnswer.text : argAnswer.answer) || [""] ; ;
        let arrayAnswers = Array.isArray(tempText)==true ? tempText : new Array( tempText ) ;
        //
        outDiv = <p style={{...tempStyle,marginBottom:'0'}} key={argKey} >
            {
                arrayAnswers.map((eleTT,idxTT)=>{
                    //eleTT = eleTT.replace(/\n/g, "<br />") ;
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
                                    iconFile = <video loop="" autoPlay="" muted="" style={{marginTop:'10px',minHeight:'30vh' }} >
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
const parseOption   = (argAnswer,tempStyle,argKey,argOnClickOpcion,argToggleInput) => {
    let outEle = false ;
    try {
        if ( argAnswer.options.length>0 ){
            if ( typeof argToggleInput=="function" ){
                argToggleInput(false,'desde define options: ') ;
            } else {
                console.log('...no es funcion, que es?? argToggleInput:: ',argToggleInput) ;
            }
        }
        outEle =    <div >
                        <span>{<ReactRenderDynamic text={argAnswer.text} />}</span>
                        {
                            argAnswer.options.map((elemInner, elemIdx)=>{
                                return (
                                    <Tag    key={elemIdx} style={{marginTop:'5px'}}
                                            onClick={ (argEE)=>{
                                                argEE.preventDefault() ;
                                                // console.log('.....voy a cambiar toggle despues de optionssss:: argToggleInput: ',argToggleInput) ;
                                                argToggleInput(true,'desde click en tag: '+elemInner.label) ;
                                                argOnClickOpcion(elemInner.value) ;
                                            }}
                                    >
                                        {elemInner.label}
                                    </Tag>
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
    json: parseJson ,
    options: parseOption ,
    carousel: parseCarousel
}
//
//export const parseAnswer = (argAnswer, argStyle={}, toggleInput) => {
export const parseAnswer = ( argParams ) => {
    try {
        //
        const { answer, customStyle, onClickOpcion, toggleInput } = argParams ;
        //
        /*
        let flagHayOpciones  = false ;
        let flagCambieEstado = false ;
        if ( toggleInput && typeof toggleInput=="function" ){
            toggleInput(false, 'desde inicio parseAnswer') ;
            flagCambieEstado = true ;
            // console.log('....(A) cambie de estado el input ') ;
        }
        */
        //
        let arrayOut     = [] ;
        let arrayAnswers = Array.isArray(answer) ? answer : new Array(answer);
        for ( let indArr=0; indArr<arrayAnswers.length; indArr++ ){
            let answerElem = arrayAnswers[ indArr ] ;
            // console.log('....parseAnswer:: indArr: ',indArr,' type:: ',answerElem.type) ;
            let parser    = allParsers[ answerElem.type ] || false ;
            if ( parser==false ){
                throw new Error('ERROR: Answer type "'+answerElem.type+'" is unknown. Answer:: '+JSON.stringify(answerElem)) ;
            }
            //
            //  if ( answerElem.type=="options" ){ flagHayOpciones = true; }
            //
            arrayOut.push(
                <div key={indArr} >
                    { parser( answerElem, customStyle, indArr, onClickOpcion, toggleInput ) }
                    { parseFiles( answerElem, indArr ) }
                </div>
            ) ;
        }
        //
        /*
        if ( flagCambieEstado==true && flagHayOpciones==false ){
            toggleInput(true, 'fin de parse') ;
            flagCambieEstado = false ;
            //console.log('....ya ejecuteeeeee') ;
        }
        */
        //
        return arrayOut ;
    } catch(errPA){
        console.dir(errPA) ;
        throw errPA ;
    }
}