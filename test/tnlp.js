/*
*
*/
import { trainAsistente }    from '../server/chatbot/chatbot' ;
//
console.dir(trainAsistente) ;
trainAsistente("sss","333")
    .then((rr)=>{
        console.log('....termin trainNLP') ;
        console.dir(rr) ;
    })
    .catch((rrErr)=>{
        console.log('....ERROR: termine trainNLP') ;
    }) ;
//