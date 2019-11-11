 /*
*
*/
const { NlpManager }  = require('node-nlp') ;
//
const cacheSessiones   = {} ;
const defaultTrainning = [
		{
			"domain":"chat",
			"entity":"chat.greeting",
            "examples":["hola","hi","como andas ?","que haces?","que hacias?"],
            "answer":{type:'text',answer:"Hola, ¿ como te puedo ayudar ?"}
        },
        {
			"domain":"chat",
			"entity":"chat.chau",
            "examples":["me voy","chau","ya fue","nos vemos","ahi nos olemos"],
            "answer": {type:"image",source:"/img/china.jpg"}
        },
        {
			"domain":"simpsons",
			"entity":"simpsons.nerd",
            "examples":["nerd","inteligente","anda a estudiar"],
            "answer": {type:"image",source:"/img/nerd.gif"}
		},
        {
			"domain":"simpsons",
			"entity":"simpsons.fanatico",
            "examples":["simpsons","ay caramba!","a la grande le puse cuca","marge"],
            "answer": {type:"option",title:"Fanatico de los simpsons, deberas elejir:",
                options:[
                {value:"hola",label:"mandando saludosss"},
                {value:"lavadora",label:"La lavadora"},
                {value:"caja",label:"la caja"}
            ]}
        },
        {
			"domain":"simpsons",
			"entity":"simpsons.plandental",
            "examples":["plan dental"],
            "answer":{type:'text',answer:"Liza necesita frenos"}
        },
        {
			"domain":"simpsons",
			"entity":"simpsons.lizanecesitarenos",
            "examples":["Liza necesita frenos"],
            "answer":{type:'text',answer:"plan dental"}
        },
        {
			"domain":"puteadas",
			"entity":"puteadas.mal",
            "examples":["putaso","trolo","hijo de puta","HDP","concha de tu madre",],
            "answer": {type:"image",source:"/img/escribir.gif",alt:"Lo voy a anotar en mi maquina de escribir invisible"}
        },
	] ;
//
export const trainAsistente = (argLanguage,argTrainning) => {
    return new Promise(function(respOk,respRech){
        try {
            const manager = new NlpManager({ languages: ['es', 'en', 'pt'] });
            //
            /*
            manager.assignDomain('es', 'greeting.hello', 'chatty');
            manager.addDocument('en', 'hola'       , 'greeting.hello');
            manager.addDocument('es', 'hola'       , 'greeting.hello');
            manager.addDocument('es', 'como andas?', 'greeting.hello');
            manager.addDocument('es', 'como andas?', 'greeting.hello');
            manager.addDocument('es', 'todo bien?' , 'greeting.hello');
            manager.addDocument('es', 'que hacias?', 'greeting.hello');
            manager.addAnswer('es', 'greeting.hello', 'Todo bien, vos? En que te puedo ayudar ?');
            */
            //
            if ( !argTrainning ){ argTrainning=defaultTrainning; }
            let tempEntity = {} ;
            for( let ix=0; ix<argTrainning.length;ix++){
                let objTrain = argTrainning[ix] ;
                if ( !tempEntity[objTrain.domain] ){
                    tempEntity[objTrain.entity] = objTrain.entity ;
                    manager.assignDomain( argLanguage, objTrain.entity , objTrain.domain );
                }
                objTrain.examples.forEach((elemExample)=>{
                    manager.addDocument( argLanguage , elemExample , objTrain.entity );
                }) ;
                manager.addAnswer( argLanguage , objTrain.entity , objTrain.answer );
            }
            //
            manager.train()
                .then((respTrain)=>{
                    console.log('....termino de entrenar') ;
                    respOk(manager) ;
                })
                .catch((respErr)=>{
                    console.dir(respErr) ;
                    respRech(respErr) ;
                }) ;
            //
            //const classifications = manager.process('hello');
            //console.log(classifications);
            //
        } catch(errTNLP){
            console.dir(errTNLP) ;
            respRech(errTNLP) ;
        }
    }) ;
}
//
export const assistantManager = (argDb) => {
    //
    const getAsistente = (argIdAgente) => {
        return new Promise(function(respOk,respRech){
            try {
                //
                if ( cacheSessiones[argIdAgente] ){
                    let cacheAsistente = cacheSessiones[argIdAgente] ;
                    respOk( cacheAsistente ) ;
                    //
                } else {
                    console.log('....getAsistente::voy a agregar el agente:: '+argIdAgente+';') ;
                    cacheSessiones[argIdAgente] = {} ;
                    //
                    argDb.chatbot.qry( {_id:argIdAgente} )
                        .then((respAsis)=>{
                            //
                            if ( respAsis.length>0 ){ respAsis=respAsis[0]; }
                            if ( !respAsis.trainning ){ respAsis.trainning=false; }
                            cacheSessiones[argIdAgente] = trainAsistente(respAsis.language,respAsis.trainning) ;
                            //
                            respOk( cacheSessiones[argIdAgente] ) ;
                            //
                        })
                        .catch((respErr)=>{
                            console.dir(respErr) ;
                            respRech(respErr) ;
                        }) ;
                }
                //
            } catch(errGetAs){
                console.dir(errGetAs) ;
                respRech(errGetAs) ;
            }
        }.bind(this)) ;
    } ;
    //
    return {
        get: getAsistente
    } ;
} ;
//