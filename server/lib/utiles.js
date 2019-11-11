/*
*
*//*
*  Funciones genericas y utilitarios
*/
const fs                  = require('fs')       ;
const path                = require('path')     ;
//
class Util {
    //
    constructor(){
        this.distPath = path.join(__dirname, '../../dist') ;
    }
    //
    getDistPath(){
        return this.distPath ;
    }
    //
    parseArchivoJson2Js(argArchivo){
        let outJsonJs = {} ;
        try {
            let jsonString = fs.readFileSync( argArchivo );
            outJsonJs      = JSON.parse(jsonString) ;
        } catch(errParse){
            throw errParse ;
        }
        return outJsonJs ;
    }
    //
    htmlContent(argHtmlFile){
        let htmlConceptos = '' ;
        try{
            let htmlDir       = this.distPath+'/'+argHtmlFile;
            htmlConceptos     = fs.readFileSync( htmlDir );
        } catch(errReadHtml){
            throw errReadHtml ;
        }
        return htmlConceptos ;
    }
    //
    groupBy(array, cb, mapCb, flagDuplicados=true ) {
        var groups           = Object.create(null);
        let objSinDuplicados = {} ;
        array.forEach(function (o) {
            var key = cb(o);
            groups[key] = groups[key] || [];
            let obj2Guardar = o ;
            if ( typeof mapCb!="undefined" ){
                obj2Guardar = mapCb(o) ;
            }
            // Controla duplicados
            if ( flagDuplicados===false ){
                let keyBuscaPrev = key.trim() + String(obj2Guardar).trim() ;
                if ( !objSinDuplicados[ keyBuscaPrev ]  ){
                    groups[key].push( obj2Guardar );
                }
                objSinDuplicados[ keyBuscaPrev ] = true ;
            } else {
                groups[key].push( obj2Guardar );
            }
        });
        return groups;
    }
    //
    capitalPlural(argStr,argFlag=false){
        let outStr = String(argStr).toUpperCase().trim() ;
        try {
            outStr = outStr.substr(0,1).toUpperCase() + outStr.substr(1) ;
            if ( argFlag==true && outStr.substr((outStr.length-1),1)!="s" ){
                switch( outStr.substr((outStr.length-2),2) ){
                    case 'ed': outStr += 'es' ; break ;
                    case 'or': outStr += 'es' ; break ;
                    default: outStr+="s" ; break ;
                }
            }
        } catch(errCP){ console.dir(errCP);  }
        return outStr ;
    }
    //
}
//
module.exports.classUtilitario = Util ;
//
module.exports.Utilitarios = () => {
    return new Util() ;
}