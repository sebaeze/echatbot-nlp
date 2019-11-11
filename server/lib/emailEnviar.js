/*
*
*/
module.exports.email = (argConfig,argEmailDestino) => {
    let tempEmailMuesta = '"'+argConfig.email.nombreMuestraEmailGateway+'" <'+argConfig.email.emailGateway+'>' ;
    console.log('...conf: '+argConfig.email.nombreMuestraEmailGateway+' temp: '+tempEmailMuesta) ;
    //argConfig.email.nombreMuestraEmailGateway = argConfig.email.nombreMuestraEmailGateway+' ( '+argConfig.email.emailGateway+' )' ;
    let emailDestino = argEmailDestino || ((process.env.AMBIENTE && process.env.AMBIENTE=='produccion') ? argConfig.email.emailEmpresa : argConfig.email.emailSoporte) ;
    //console.log('...enviando email a => '+emailDestino+';') ;
    return require('gmail-send')({
        user: argConfig.email.emailGateway,
        pass: argConfig.email.passwordEmailGateway,
        to:   emailDestino,
        bcc:  argConfig.email.emailSoporte,
        // to:   credentials.user,                  // Send to yourself
                                                 // you also may set array of recipients:
                                                 // [ 'user1@gmail.com', 'user2@gmail.com' ]
        // from:    credentials.user,            // from: by default equals to user
        from: tempEmailMuesta  ,
        // replyTo: credentials.user,            // replyTo: by default undefined
        // bcc: 'some-user@mail.com',            // almost any option of `nodemailer` will be passed to it
        subject: 'test subject',
        //text:    'gmail-send example 1',         // Plain text
        html:    '<b>html text</b>'            // HTML
      });
} ;
//