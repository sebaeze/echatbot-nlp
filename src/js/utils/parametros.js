/*
*
*/
//
export const PARAMETROS   = {
    CHATBOT_STATUS:{
        ACTIVE: 'ACTIVE',
        INACTIVE: 'INACTIVE'
    },
    BACKEND:{
        API_CHATBOT: __URL_BACKEND__ + '/chatbot/qry',
        API_SESSION: __URL_BACKEND__ + '/chatbot/session'
    },
    SESSION:{
        ID_CONVERSATION:'WAIBOCIDCONVERSATION'
    }
} ;
//
export const opcionesPOST = {
    method: 'POST',
    headers: {
        'content-type': 'application/json',
        'accept':'application/json'
    },
    credentials: "same-origin",
    json: true,
    body: null
};
//
export const obj2qryString = (argJsObject) =>{
	let outQueryString = '' ;
	let arrayQry       = [] ;

	for ( let keyObj in argJsObject ){
		let datoKey  = argJsObject[keyObj] ;
		if ( typeof datoKey=="object" ){
			if ( Array.isArray(datoKey)){
				arrayQry.push( keyObj+'='+datoKey.join(',')   ) ;
			} else {
				let tempArrayObjUrl = [] ;
				for ( let keyObjDat in datoKey ){
					tempArrayObjUrl.push( keyObjDat+'='+datoKey[keyObjDat]  ) ;
				}
				arrayQry.push(  tempArrayObjUrl.join('&') ) ;
			}
		} else {
            if ( datoKey ){
                if ( isNaN(datoKey) ){
                    if ( datoKey.length>0 ){
                        arrayQry.push( keyObj+'='+datoKey ) ;
                    }
                } else {
                    arrayQry.push( keyObj+'='+datoKey ) ;
                }
            } else {
                console.log('.....se pierde la key ?? ') ;
                console.dir(argJsObject) ;
            }
		}
	}
	if ( arrayQry.length>0 ){
		outQueryString = '?' +  ( Array.isArray(argJsObject) ? arrayQry.join(',') : arrayQry.join('&') ) ;
	}
	return outQueryString ;
};
//