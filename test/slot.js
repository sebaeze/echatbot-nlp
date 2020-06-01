/*
*   conditions.push(`(?<=${leftWord})(.*)(?=${rightWord})`);
*/
const { NlpManager, NlgManager, ConversationContext  }               = require('node-nlp')      ;
const { SimilarSearch } = require('node-nlp') ;
const request           = require('request')  ;
console.log('...SimilarSearch: ',SimilarSearch) ;
/*
const { SlotManager } = require('@nlpjs/slot');
const slotMng = new SlotManager();
console.log('...slotMng: ',slotMng) ;
*/
//
//
const replaceVariables = (argAnswer) => {
    try {
        if ( argAnswer.entities && argAnswer.entities.length>0 ){
            argAnswer.entities.forEach((elem)=>{
                if ( argAnswer.answer && elem.entity && argAnswer.answer.indexOf(elem.entity)!=-1 ){
                    let arrayVariables = argAnswer.answer.match( /\##(.*?)\##/g ) ;
                    let entityVal  = elem.utteranceText ;
                   argAnswer.answer = argAnswer.answer.replace(`##${elem.entity}##`,entityVal) ;
                }
            }) ;
        }
        return argAnswer ;
    } catch(errRV){
        console.log('....error: ',errRV) ;
        throw errRV ;
    }
}
//
const context = new ConversationContext();
const argMng  = new NlpManager({
                        languages: ['es', 'en', 'pt'],
                        nlu: { log: false, useNoneFeature: true }
                        /*
                        processTransformer: function (originalProcessOutput) {
                            console.log('....originalProcessOutput: ',originalProcessOutput,';')
                            return Object.assign(originalProcessOutput, { anything: 'you want' })
                        }
                        */
                    }) ;
//
/*
const hola = (argT) => {
    console.log('......holaaaa:: arg: '+argT+';') ;
} ;
argMng.container.register('Hola', hola, false) ;
console.log('....(B) nlpMngContainer.hola: ',argMng.Hola) ;
argMng.nlp.Hola() ;
return false ;
*/
//
main = async () => {
    //
    // argMng.addDocument( 'es' , 'la ciudad se llama %userCiudad% aca' , 'tu.ciudad' ) ;
    // argMng.addDocument( 'es' , 'cityyyy' , 'tu.ciudad.ask' ) ;
    //
    /*
    addBetweenCondition(locale, name, left, right, opts) {
        return this.nlp.addNerBetweenCondition(locale, name, left, right, opts);
    }
    */
    //argMng.addBetweenCondition(   'es' , 'miNombre', 'mi nombre es','' ) ;
    // argMng.addAfterLastCondition( 'es' , 'miNombre' ) ;
    //
    // argMng.addBeforeCondition(   'es' , 'miNombre', 'mi nombre es '  ) ;
    // argMng.addBeforeFirstCondition(   'es' , 'miNombre', 'mi nombre es '  ) ;
    /*
    argMng.addBetweenCondition(   'es' , 'miNombre', 'mi nombre es', 'abcde' , { skip: ['tu.nombre'] }  ) ;
    argMng.addAfterLastCondition( 'es' , 'miNombre' ) ;
    */
    // argMng.addRegexEntity( 'miNombre', 'es', "/(?<=nombre es)(.*?)(?=\\s+)/" ) ;
    // argMng.addBetweenCondition(   'es' , 'miNombre', 'mi nombre es', '' /* , { skip: ['tu.nombre'] } */ ) ;
    // argMng.addBeforeCondition(   'es' , 'miNombre', 'mi nombre es'  ) ;
    // argMng.addRegexEntity( 'miNombre', 'es', "/(?<=nombre es)(.*?)/" ) ;
    // argMng.addRegexEntity( 'miNombre', 'es', /(?<=nombre es)(.*?)(?=(,|$|\n|\r))/ig ) ;
    // argMng.addBetweenCondition(   'es' , 'miNombre', 'mi nombre es', ',|$|\n|\r' /* , { skip: ['tu.nombre'] } */ ) ;
    // argMng.addBetweenCondition(   'es' , 'miNombre', 'mi nombre es', '\s'  ) ;
    // argMng.addBetweenCondition(   'es' , 'miNombre', 'mi nombre es', 'abcde'  ) ;
   //
    let varBus  = 'soy el ' ;
    // let stregex = `/(?<=${varBus})(.*?)(?=(,|$|\n|\r))/ig` ;
    let stregex = `/(?<=${varBus}).*?(?=\s)/ig` ;
    // console.log('...stregex: ',stregex,';') ;
    argMng.addRegexEntity( '##MINOMBRE##' , 'es', stregex ) ;
    // argMng.addBeforeCondition( 'es', '##MINOMBRE##', ' el ', {} ) ;
    argMng.nlp.slotManager.addSlot( 'tu.nombre' , '##MINOMBRE##',  true , {'es':'¿ Cual es su nombre ?'} ) ;
    /*
    argMng.addBetweenCondition(   'es' , 'tu.ciudad', 'llama' , 'aca' );
    argMng.addAfterLastCondition( 'es' , 'tu.ciudad', 'llama' ) ;
    argMng.nlp.slotManager.addSlot( 'tu.ciudad', 'userCiudad' , true, {'es':'donde?'} ) ;
    */
    argMng.addDocument( 'es' , 'soy el' , 'tu.nombre'  ) ;
    argMng.addDocument( 'es' , 'soy el ##MINOMBRE## ' , 'tu.nombre' ) ;
    argMng.addAnswer(   'es' , 'tu.nombre' , 'holaa ##MINOMBRE## ' );
    /*
    argMng.addAction('tu.nombre', 'getNombre', 'es lo q hay', (input) => {
        return new Promise(function(respOk,respRech){
            try {
                //
                request.get({url: 'http://dummy.restapiexample.com/api/v1/employees', json: true }, function(error, response, body) {
                    if ( error ) {
                        console.log('....request:ERROR: ',error) ;
                    } else {
                        console.log(body);
                    }
                    respOk( input ) ;
                  }) ;
            } catch(errAA){
                respRech(errAA) ;
            }
        }.bind(this)) ;
    });
    */
    //
    //argMng.addDocument( 'es' , 'mi nombre es  %miNombre% aca' , 'tu.nombre' ) ;
    // argMng.addAnswer(   'es' , 'chau' , '...tu estas en {{userCiudad}} ...' );
    // argMng.addAnswer( 'es' , 'tu.ciudad.ask', '...{{userCiudad}} ... ' ) ;
    //
    await argMng.train();
    //
    // const result1 = await argMng.process('es', 'mi nombre es', context);
    //console.log('....(A) context: ',context) ;
    // const result1 = await argMng.process('es', 'mi nombre es sebastian abcde que se yo #' , context);
    const result1 = await argMng.process('es', 'soy el sebastian' , context);
    console.log('\n ...result1: ',result1,';') ;
    //
    /*
    console.log('..getActions: ', argMng.nlp.getActions('tu.nombre')) ;
    const result3 = argMng.findAllAnswers( 'es', 'tu.nombre', {}, {} ) ;
    console.log('\n ...result3: ',result3,';') ;
    */
    // console.log('...resu111: ', replaceVariables(result1),';' ) ;
    // console.log('.......slotFill: ',result1.slotFill.entities,';') ;
    // console.log('....(A) context: ',context) ;
    //
    // console.log('.......result1: ',replaceVariables(result1),';') ;
    /*
    const result2 = await argMng.process('es', 'sebastiannnn', context);
    console.log('.......result2: ',replaceVariables(result2),';') ;
    */
}
//
main() ;
//