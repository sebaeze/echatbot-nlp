/*
*
*/
const Schema = require('mongoose').Schema     ;
const moment = require('moment-timezone')     ;
//
module.exports = new Schema({
    _id: String ,
    tipo: {type: String,default: '' } ,
    titulo: {type: String,default: '' },
    visitas: [] ,
    ts_ultima_visita: { type: Date, default: moment( new Date() ).tz("America/Argentina/Buenos_Aires") } ,
    cantidadVisitas: Number ,
    ts_insert: { type: Date, default: moment( new Date() ).tz("America/Argentina/Buenos_Aires") }
}) ;
//