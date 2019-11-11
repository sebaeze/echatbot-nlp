/*
*
*/
const promiseFindById = (docModel,docElem,argArrayBorrar=['ts_ingreso','ts_baja','urlInterna','contador'],argArrayUpdExiste=[]) => {
    return new Promise(function(respDoc,respRech){
        try {
            if ( docElem._id && String(docElem._id).length>0 ){
                docModel.findById(docElem._id, function (err, doc) {
                    if (err){
                        console.log('....error__findBtID: ') ;
                        respRech(err) ;
                    } else {
                        let tempDoc = {...docElem} ;
                        if ( argArrayBorrar.length>0 ){
                            argArrayBorrar.forEach(function(elemKey){
                                delete tempDoc[elemKey] ;
                            }.bind(tempDoc)) ;
                        }
                        if ( doc ){
                            if ( argArrayUpdExiste.length>0 ){
                                let tempCamposUpdate = {} ;
                                argArrayUpdExiste.forEach(function(keyNew){
                                    tempCamposUpdate[keyNew]=tempDoc[keyNew] ;
                                }.bind(this)) ;
                                console.log('.....actualizo solo estos campos: ') ;
                                console.dir(tempCamposUpdate) ;
                                doc = Object.assign(doc,tempCamposUpdate) ;
                            } else {
                                doc = Object.assign(doc,tempDoc) ;
                            }
                        } else {
                            doc = new docModel(tempDoc) ;
                            doc = Object.assign(doc,tempDoc) ;
                        }
                        //
                        if ( doc.isNew==true ){
                            doc.save(function(errSave,docSave){
                                if ( errSave ){ respRech(errSave); }
                                else{
                                    respDoc( docSave ) ;
                                }
                            }.bind(this));
                        } else {
                            respDoc( doc ) ;
                        }
                    }
                    //
                  }.bind(this));
            } else {
                console.dir(docElem);
                doc = new docModel(docElem) ;
                doc.save(function(errSave,docSave){
                    if ( errSave ){ respRech(errSave); }
                    else{
                        respDoc( docSave ) ;
                    }
                }.bind(this));
            }
            //
        } catch(errProFU){ console.log('ERROR: docElem: '); console.dir(docElem); respRech(errProFU); }
    }.bind(this)) ;
} ;
//
const promiseFindUpdate = (docModel,docElem,argArrayBorrar=['ts_ingreso','ts_baja','urlInterna','contador'],argArrayUpdExiste=[]) => {
    return new Promise(function(respDoc,respRech){
        try {
            if ( docElem._id && String(docElem._id).length>0 ){
                docModel.findById(docElem._id, function (err, doc) {
                    if (err){ console.log('....error__findBtID: '); respRech(err); }
                    //
                    let tempDoc = {...docElem} ;
                    //
                    if ( argArrayBorrar.length>0 ){
                        argArrayBorrar.forEach(function(elemKey){
                            delete tempDoc[elemKey] ;
                        }.bind(tempDoc)) ;
                    }
                    //
                    if ( doc ){
                        if ( argArrayUpdExiste.length>0 ){
                            let tempCamposUpdate = {} ;
                            argArrayUpdExiste.forEach(function(keyNew){
                                tempCamposUpdate[keyNew]=tempDoc[keyNew] ;
                            }.bind(this)) ;
                            console.log('.....actualizo solo estos campos: ') ;
                            console.dir(tempCamposUpdate) ;
                            doc = Object.assign(doc,tempCamposUpdate) ;
                        } else {
                            doc = Object.assign(doc,tempDoc) ;
                        }
                    } else {
                        doc = new docModel(tempDoc) ;
                        doc = Object.assign(doc,tempDoc) ;
                    }
                    //
                    /*
                    if ( !doc ){ doc=new docModel(docElem); }
                    doc = Object.assign(doc,tempDoc) ;
                    */
                    if ( !doc.contador ){ doc.contador=0; }
                    doc.contador++ ;
                    //
                    doc.save(function(errSave,docSave){
                        if ( errSave ){ respRech(errSave); }
                        else{
                            respDoc( docSave ) ;
                        }
                    }.bind(this));
                    //
                  }.bind(this));
            } else {
                console.dir(docElem);
                doc = new docModel(docElem) ;
                doc.save(function(errSave,docSave){
                    if ( errSave ){ respRech(errSave); }
                    else{
                        respDoc( docSave ) ;
                    }
                }.bind(this));
            }
            //
        } catch(errProFU){ console.log('ERROR: docElem: '); console.dir(docElem); respRech(errProFU); }
    }.bind(this)) ;
} ;
//
const promiseFindDelete = (docModel,docElem) => {
    return new Promise(function(respDoc,respRech){
        try {
            docModel.findById(docElem._id, function (err, doc) {
                if (err){ console.log('....error__findBtID: '); respRech(err); }
                //
                let tempDoc = {...docElem} ;
                //
                if ( !doc ){ doc=new docModel(docElem); }
                doc = Object.assign(doc,tempDoc) ;
                if ( !doc.contador ){ doc.contador=0; }
                doc.contador++ ;
                //
                doc.remove(function(errDel,docDel){
                    if ( errDel ){ respRech(errDel); }
                    else{
                        respDoc( {mensaje:'Documento borrado correctamente'} ) ;
                    }
                }.bind(this));
              }.bind(this));
        } catch(errProFU){ respRech(errProFU); }
    }.bind(this)) ;
} ;
//
module.exports = {
    promiseFindById: promiseFindById,
    promiseFindUpdate: promiseFindUpdate,
    promiseFindDelete: promiseFindDelete
} ;
//
