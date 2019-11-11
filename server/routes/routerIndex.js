/*
*
*/
const path              = require('path')    ;
const express           = require('express') ;
const router            = require('express').Router()   ;
//
let opciones = {
  dotfiles: 'ignore',etag: false,extensions: [],index: false,maxAge: '1d' ,redirect: false,
  setHeaders: function (res, argPath, argStat) {
      res.set('Access-Control-Allow-Origin'     , '*'  );
      res.set("Access-Control-Allow-Credentials", true );
      res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Connection', 'Keep-Alive') ;
      console.dir(argPath) ;
      console.dir(argStat) ;
      }
  } ;
/*
*
*/
module.exports = (argConfig,argDb) => {
  //
  router.use('/', express.static( path.join(__dirname,'../../dist') , opciones ) );
  //
  router.get('/', function(req, res) {
    res.set('access-Control-Allow-Origin', '*');
    res.set('access-Control-Allow-Methods', '*');
    res.set("Access-Control-Allow-Headers","X-PINGOTHER, Content-Type" ) ;
    res.setHeader("Access-Control-Allow-Credentials", true);
    //
    res.type('.js');
    res.sendFile( path.join(__dirname,'../../dist/widget.js') );
    //
  });
  //
  router.get('/404', function(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", true);
    //
    res.json({
      error:"404 - url not found",
      code: 404
    }) ;
    //
  });
  //
  return router ;
} ;
//