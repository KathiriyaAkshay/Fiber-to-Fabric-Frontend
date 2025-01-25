import React, {useState, useEffect} from "react";
import { Modal, Button, Table } from "antd";
import { BEAM_SALE_BILL_MODEL, BEAM_SALE_MODEL_NAME, JOB_GREAY_BILL_MODEL_NAME, JOB_GREAY_SALE_BILL_MODEL, JOB_REWORK_BILL_MODEL, JOB_REWORK_MODEL_NAME, JOB_TAKA_BILL_MODEL, JOB_TAKA_MODEL_NAME, JOB_WORK_BILL_MODEL, JOB_WORK_MODEL_NAME, PURCHASE_TAKA_BILL_MODEL, PURCHASE_TAKA_MODEL_NAME, RECEIVE_BEAM_RETURN_MODEL_NAME, RECEIVE_SIZE_BEAM_BILL_MODEL, SALE_BILL_MODEL, SALE_BILL_MODEL_NAME, YARN_RECEIVE_BILL_MODEL, YARN_RECEIVE_MODEL_NAME, YARN_SALE_BILL_MODEL, YARN_SALE_BILL_MODEL_NAME } from "../../../../constants/bill.model";
 
const CashbookAuditConfirmed = ({isOpen, handleClose, data, CashbookStatementVerify, isCashbookPending}) => {
    const [dataSource, setDataSource] = useState([]) ;
    const columns = [
        {
          title: 'Title',
          dataIndex: 'label',
          key: 'label',
          width: '50%',
          render: (text) => <strong>{text}</strong>,
        },
        {
          title: 'Value',
          dataIndex: 'data',
          key: 'value',
          render: (text, record) => {
            if (record?.label !== "Bill Type" ){
                return(
                    <div>
                        {record?.value}
                    </div>
                )
            }   else {
                return (
                    <div>
                      {Object.entries(record?.value || {}).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key == YARN_SALE_BILL_MODEL?YARN_SALE_BILL_MODEL_NAME:
                            key == BEAM_SALE_BILL_MODEL?BEAM_SALE_MODEL_NAME:
                            key == SALE_BILL_MODEL?SALE_BILL_MODEL_NAME:
                            key == JOB_WORK_BILL_MODEL?JOB_WORK_MODEL_NAME:
                            key == JOB_GREAY_SALE_BILL_MODEL?JOB_GREAY_BILL_MODEL_NAME:
                            key == YARN_RECEIVE_BILL_MODEL?YARN_RECEIVE_MODEL_NAME:
                            key == RECEIVE_SIZE_BEAM_BILL_MODEL?RECEIVE_BEAM_RETURN_MODEL_NAME:
                            key == PURCHASE_TAKA_BILL_MODEL?PURCHASE_TAKA_MODEL_NAME:
                            key == JOB_TAKA_BILL_MODEL?JOB_TAKA_MODEL_NAME:
                            key == JOB_REWORK_BILL_MODEL?JOB_REWORK_MODEL_NAME:""}: </strong>
                          {(Array.isArray(value) ? value : [value])
                            .map((element) => element || "N/A")
                            .join(", ")}
                        </div>
                      ))}
                    </div>
                );
                  
            }
          }
        },
    ];

    useEffect(() => {
        if (data){
            let temp = [] ; 
            temp.push({
                label: "Particular type", 
                value: "Interest Received"
            }); 

            // Party and Supplier name and company information is pending

            // Bill type information 
            let bill_type = {} ; 
            data?.bill_interest_paid_audits?.map((element) => {
                if (!bill_type[element?.model]){
                    bill_type[element?.model] = [] ; 
                }

                bill_type[element?.model].push(element?.bill_no) ; 
            })

            temp.push({
                label: "Bill Type", 
                value: bill_type
            })
        
            // Interest invoice information 
            temp.push({
                label: "Bill No", 
                value: data?.bill_interest_paid_audits?.map((element) => element?.bill_no || "N/A").join(", ")
            })

            let interest_amount = 0 ;
            data?.bill_interest_paid_audits?.map((element) => {
                interest_amount = +interest_amount + +element?.interest_amount
            })

            // Interst amount information 
            temp.push({
                label: "Interest Amount", 
                value: parseFloat(interest_amount).toFixed(2)
            })

            setDataSource(temp) ; 
        }
    }, [data])

    return(
        <Modal
            open = {isOpen}
            isOpen = {isOpen}
            onCancel={handleClose}
            title = {
                <div>
                    Verified Entry
                </div>
            }
            onOk={CashbookStatementVerify}
            okText = {"Confirm entry"}
            className="view-in-house-quality-model"
            classNames={{
                header: "text-center",
            }}
            confirmLoading = {isCashbookPending}
            styles={{
                content: {
                    padding: 0,
                    width: "600px",
                    margin: "auto",
                },
                header: {
                    padding: "16px",
                    margin: 0,
                },
                body: {
                    padding: "10px 16px",
                },
                footer : {
                    paddingBottom: 10, 
                    paddingRight: 10
                }
            }}
            centered
        >
            <Table
                dataSource={dataSource}
                columns={columns}
                pagination = {false}
                // showHeader = {false}
            />
        </Modal>
    )
}

export default CashbookAuditConfirmed