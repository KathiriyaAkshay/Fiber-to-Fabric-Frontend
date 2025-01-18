import React, { useEffect, useState } from "react";
import { Modal, Table, Input, DatePicker, Button, message } from "antd";
import moment from "moment";
import dayjs from "dayjs";

function calculateDaysDifference(dueDate) {
    const today = new Date(); // Get today's date
    const [day, month, year] = dueDate.split('-');
    const due = new Date(year, month - 1, day);
    const timeDifference = today - due; // Difference in milliseconds
    const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    return dayDifference;
}

const CalculateInterest = (due_days, bill_amount) => {
    const INTEREST_RATE = 0.12; // Annual interest rate of 12%
    if (due_days <= 0 || bill_amount <= 0) {
      return 0; // Return 0 if inputs are invalid
    }
    // Calculate interest
    const interestAmount = (+bill_amount * INTEREST_RATE * due_days) / 365;
    return interestAmount.toFixed(2); // Return the interest amount rounded to 2 decimal places
  };

const InterestPaymentModal = ({ visible, onConfirm, onCancel, selectedInterestBill }) => {
    
    const [data, setData] = useState([]);
    const [totalInterest, setTotalInterest] = useState(undefined) ; 
    const [interestAmount, setInterestAmount] = useState("") ; 
    const [dueDate, setDueDate] = useState(new dayjs()) ; 

    const handleInterestChange = (value, record) => {
        const updatedData = data.map((item) =>
            item.bill_no == record?.bill_no && item?.model == record?.model ? { ...item, interest: value } : item
        );
        setData(updatedData);
    };

    const columns = [
        { title: "No", dataIndex: "no", key: "no" },
        { title: "Bill No.", dataIndex: "billNo", key: "billNo" },
        {
            title: "Interest",
            dataIndex: "interest",
            key: "interest",
            render: (text, record) => (
                <Input
                    value={record.interest}
                    placeholder="Interest amount"
                    onChange={(e) => handleInterestChange(e.target.value, record)}
                />
            ),
        },
    ];


    function disabledFutureDate(current) {
     return current && current > moment().endOf("day");
    }

    useEffect(() => {
        if (selectedInterestBill?.length > 0){
            let temp = [] ; 
            let total = 0 ; 
            selectedInterestBill?.map((bill, index) => {
                let dueDate= moment(bill?.due_days).format("DD-MM-YYYY") ;
                let dueDays = isNaN(calculateDaysDifference(dueDate))?0:calculateDaysDifference(dueDate) ; 
                let interestAmount = CalculateInterest(dueDays, +bill?.amount) ; 
                temp.push({
                    billNo: bill?.bill_no, 
                    interest: interestAmount, 
                    no: index + 1, 
                    ...bill
                })
                total += +interestAmount ; 
            })
            setData(temp) ; 
            setTotalInterest(parseFloat(total).toFixed(2)) ; 
            setInterestAmount(parseFloat(total).toFixed(2)) ; 
        }
    },[selectedInterestBill])

    useEffect(() => {
        if (data?.length > 0 && data !== undefined){
            let temp_total_interest = 0 ; 
            data?.map((element) => {
                temp_total_interest += +element?.interest ; 
            })
            setTotalInterest(parseFloat(temp_total_interest).toFixed(2)) ; 
        }
    }, [data]) ; 

    return (
        <Modal
            title="Collect Interest"
            open={visible}
            footer={null}
            onCancel={onCancel}
            className="view-in-house-quality-model"
            classNames={{
                header: "text-center",
            }}
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
            }}
        >
            <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                bordered
                summary={() => (
                    <Table.Summary.Row>
                        <Table.Summary.Cell colSpan={2}>Total Interest</Table.Summary.Cell>
                        <Table.Summary.Cell>{totalInterest}</Table.Summary.Cell>
                    </Table.Summary.Row>
                )}
            />
            <div style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 8 }}>
                    <label>Payment Date</label>
                    <DatePicker onChange={setDueDate} value={dueDate} style={{ width: "100%" }} format="DD-MM-YYYY" disabledDate={disabledFutureDate} />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <Button onClick={onCancel}>CANCEL</Button>
                    <Button type="primary" onClick={async() => {
                        if (interestAmount == "" && interestAmount == undefined){
                            message.warning("Please, Provide interest amount") ; 
                        } else{
                            let hasError = false ; 
                            data?.map((element) => {
                                if (element?.interest == "" || element?.interest == undefined){
                                    message.warning(`Please, Enter interest amount for bill no : ${element?.bill_no}`) ; 
                                    hasError = true ; 
                                    return; 
                                }
                            })
                            if (!hasError){
                                await onConfirm(interestAmount, dueDate, data)
                            }
                        }
                    }}>
                        CONFIRM
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default InterestPaymentModal;
