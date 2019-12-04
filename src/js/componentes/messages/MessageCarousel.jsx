/*
*
*/
import React                         from 'react' ;
import { Carousel, Icon  }           from 'antd'  ;
//
export class MessageCarousel extends React.Component {
    constructor(props){
        super(props) ;
        this.next = this.next.bind(this);
        this.previous = this.previous.bind(this);
        this.carousel = React.createRef();
    } ;
    //
    next() {
        this.carousel.next();
    }
    previous() {
        this.carousel.prev();
    }
    //
    render(){
        //
        const ReactRenderDynamic = (argProps) => {
            return( <div dangerouslySetInnerHTML={{__html: argProps.text}}></div> ) ;
        } ;
        //
        let configCarousel = {
            autoplay: true,
            dots: true
            //arrows: true
        } ;
        //
        console.dir(this.props) ;
        //
        return(
            <div className="waiboc-msg-carousel">
                <span>{<ReactRenderDynamic text={this.props.message.title} />}</span>
                <Icon type="left-circle"  className="waiboc-arrow waiboc-arrow-left"  onClick={this.previous}  />
                <Icon type="right-circle" className="waiboc-arrow waiboc-arrow-right" onClick={this.next}    />
                <Carousel {...configCarousel} ref={node => (this.carousel = node)} >
                {
                    this.props.message.options.map((elemInner, elemIdx)=>{
                        return (
                            <div key={elemIdx}>
                                <h3>
                                    <span>{elemInner.label}</span>
                                </h3>
                            </div>
                        )
                    })
                }
                </Carousel>
            </div>
        )
    }
    //
} ;
//