/*
*
*/
import React             from 'react' ;
//
export class DivMessage extends React.Component {
    constructor(props){
        super(props) ;
        this.state = {} ;
        /*
        this.messagesEnd    = false ;
        this.scrollToBottom = this.scrollToBottom.bind(this) ;
        */
        //console.log('....(a) DivMessage: constructor:: ') ;
    }
    //
    componentDidMount(){
        try {
            //console.log('....(b) DivMessage: componentDidmount:: ') ;
            //this.scrollToBottom() ;
        } catch(errCDM){
            console.dir(errCDM) ;
        }
    }
    //
    componentDidUpdate() {
        //console.log('....(c) DivMessage: componentDidUpdate:: ') ;
        //this.scrollToBottom();
    }
    /*
    //
    scrollToBottom(){
        console.dir(this.messagesEnd) ;
        this.messagesEnd.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
    }
    */
    //
    render(){
        //
        /*
        console.dir(this.props) ;
        console.dir(this.props.ref) ;
        */
        // ref={(el)=>{this.props.refLastM(el); }}
        return(
            <div style={{backgroundColor: '#E0E6E5',borderRadius: '10px',padding: '15px' }} >
                <div>
                    { this.props.children }
                </div>
            </div>
        )
    }
    //
} ;
//