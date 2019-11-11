/*
*
*/
const router          = require('express').Router()   ;
//
module.exports = (argConfig) => {
    //
    router.use(function(err, req, res, next) {
        console.log(' \n ******* (B) ERROR ********** ');
        console.dir(err) ;
        let mensajeError = '' ;
        if ( typeof err=='object' ){
            mensajeError = JSON.stringify(err) ;
        } else {
            mensajeError = err ;
        }
        res.redirect('/error?mensaje='+mensajeError) ;
    });
    //
    router.use(function(req, res, next) {
        console.log(' \n *** ERROR - 404 --> url: '+req.originalUrl+'; *** \n');
        let flagAceptaJspon = ( ( req.headers && req.headers.accept ) ? String(req.headers.accept).toUpperCase().indexOf('APPLICATION/JSON')!=-1 : false ) ;
        //
        if ( flagAceptaJspon ) {
            res.status(404);
            res.send( { error: 'url: '+req.originalUrl+' Not found' } );
            return;
        }
        res.redirect('/404?Url='+req.originalUrl) ;
    });
    //
    return router ;
    //
}