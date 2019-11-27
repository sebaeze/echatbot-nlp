/*
*
*/
import mongoose, { Schema }           from 'mongoose' ;
mongoose.set('useCreateIndex', true);
const moment = require('moment-timezone')     ;
//
export const userInfo      = { email:'',name:'',lastName:'',phone:'',facebook:'',instagram:'',country:'',idUser:''} ;
export const userNavigator = { ts_creation:'', ts_last_update:'' ,ip:'', 'user-agent':'', 'accept-language': '', origin:'', host:''  } ;
//
module.exports = new Schema({
    _id: { type: Schema.ObjectId, auto: true },
    idchatbot: { type: String, default:'' },
    userInfo: { type: Schema.Types.Mixed ,default: {email:'',name:'',lastName:'',phone:'',facebook:'',instagram:'',country:'',idUser:''} } ,
    userNavigator: { type: [Schema.Types.Mixed] ,default: [] },
    conversationFormat: {type: String, uppercase: true, default:'TYPE1', enum:['TYPE1','TYPE2'] },
    conversation: { type: [ Schema.Types.Mixed ], default: [] },
    unsubscribe: { type: Boolean, default: false } ,
    ts_creation: { type: Date, default: moment( new Date() ).tz("America/Argentina/Buenos_Aires").format() } ,
    ts_last_update: { type: Date, default: moment( new Date() ).tz("America/Argentina/Buenos_Aires").format() }
}) ;
//