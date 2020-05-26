/*
*
*/
const { NlpManager, ConversationContext  }               = require('node-nlp')      ;
/*
const { SlotManager } = require('@nlpjs/slot');
const slotMng = new SlotManager();
console.log('...slotMng: ',slotMng) ;
*/
//
const context = new ConversationContext();
const argMng = new NlpManager({ languages: ['es', 'en', 'pt'], nlu: { log: false, useNoneFeature: true } }) ;
//
// console.log('......addSlot: ',argMng.nlp.slotManager.addSlot ) ;
//
main = async () => {
    //
    /*
    argMng.slotManager.addSlot('contact', 'email', true, { en: 'What is your email address?' });
    argMng.slotManager.addSlot('contact', 'phonenumber', true, { en: 'What is your phone number?' });
    */
    //
    argMng.addNamedEntityText('name', 'seba', ['es'], ['seba']);
    argMng.addDocument( 'es' , 'me llamo %name%' , 'hola.nombre' ) ;
    argMng.addAnswer(   'es' , 'hola.nombre' , '...hola!!' );
    //
    argMng.addDocument( 'es' , 'me voy llendo' , 'chau' ) ;
    argMng.addAnswer(   'es' , 'chau' , '.......chau {{name}} !!' );
    //
    // argMng.addAnswer( 'es' , 'tu.ciudad.ask', '...{{userCiudad}} ... ' ) ;
    //
    await argMng.train();
    //
    // const context = {};
    const result1 = await argMng.process('me llamo seba', undefined ,context);
    console.log('....(A) context: ',context) ;
    const result2 = await argMng.process('me voy llendo',undefined, context);
    console.log('....(B) context: ',context) ;
    //
    console.log('.... result1: ',result1 ,' \n\n......result2: ',result2 );
}
//
main() ;
//