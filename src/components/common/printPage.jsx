import { Button } from "antd";
import React, { useRef } from "react";
import { useState, useEffect } from "react";
import { PrinterOutlined } from "@ant-design/icons";
import "./printPage.css"; 
import ReactToPrint from "react-to-print";

const PrintPage = () => {
    const ComponentRef = useRef() ; 
    const pageStyle = `
        @media print {
            body {
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
            }
            .print-instructions {
                display: none;
            }
            .printable-content {
                width: 100%;
                margin-top: 0;
                padding-top: 0;
            }
        }` ; 
    const [orderData, setOrderData] = useState([]) ; 
    const [orderTitle, setOrderTitle] = useState(null) ; 
    const [tableHead, setTableHead] = useState(null) ; 
    
    useEffect(() => {
        let page_title = localStorage.getItem("print-title") ; 
        setOrderTitle(page_title) ; 

        let page_data = JSON.parse(localStorage.getItem("print-array")) ; 
        setOrderData(page_data) ; 

        let page_head = JSON.parse(localStorage.getItem("print-head")) ; 
        setTableHead(page_head) ; ``

    }, []); 

    return (
        <div style={{ padding: 10 }}>
            <div style={{ marginLeft: "auto", width: "100%" }}>
                <ReactToPrint
                    trigger={() => 
                        <Button style={{ marginLeft: "auto" }} type="primary" icon={<PrinterOutlined />}>
                            Print
                        </Button>
                    }
                    content={() => ComponentRef.current}
                    pageStyle={pageStyle}
                />
            </div>

            <div style={{marginTop: 10, paddingLeft: 1, paddingRight: 1}} ref={ComponentRef}>

                <div className="page_title">
                    {orderTitle}
                </div>

                <table className="printable_table">
                    <thead>
                        <tr>
                            {tableHead?.map((element) => (
                                <th>{element}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {orderData.map((order, index) => (
                            <tr key={index}>
                                {order?.map((element) => (
                                    <td>{element}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    )
}

export default PrintPage; 