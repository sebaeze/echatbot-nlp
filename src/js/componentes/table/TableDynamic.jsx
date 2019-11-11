/*
*
*/
import React             from 'react' ;
import { Table }         from 'antd'  ;
import { ColumnProps }   from 'antd/es/table' ;
//
export class TableDynamic extends React.Component {
    constructor(props){
        super(props) ;
        this.state = { jsonData: {...this.props.jsonData} } ;
    }
    //
    render(){
        //
        const defineColumns = (argArrData) => {
            let outCols = [] ;
            //
            try {
                let firstObj = argArrData[0] ;
                Object.keys(firstObj).forEach((elemKey)=>{
                    outCols.push({
                        title: elemKey,
                        dataIndex: elemKey,
                        key: elemKey,
                        sorter: (a, b) => a[elemKey].length - b[elemKey].length ,
                        sortDirections: ['descend']
                    }) ;
                }) ;
            //
            } catch(errDC){
                console.dir(errDC) ;
            }
            return outCols ;
        }
        //
        let cols = defineColumns( this.props.jsonData.restApijson ) ;
        let rows = this.props.jsonData.restApijson.map((elemRow,elemInd)=>{
            return {
                key: elemInd,
                ...elemRow
            }
        }) ;
        //
        return (
            <Table rowKey="key" dataSource={rows} columns={cols} />
        ) ;
    }
    //
} ;
//