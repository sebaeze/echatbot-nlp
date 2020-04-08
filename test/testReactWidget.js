//
import React                       from "react"     ;
import ReactDOM                    from "react-dom" ;
import WaibocReactWidget           from "../lib/waiboc-react-widget" ;
//
console.log('...WaibocReactWidget: ',WaibocReactWidget) ;
//
ReactDOM.render(
            <WaibocReactWidget
                    idAgent="5df990135940bb454c846a1e"
                    options={false}
                    secret="a132ac59-5556-48d7-97d3-a1a21cade65d"
            />,
            document.getElementById('root')
        ) ;
//