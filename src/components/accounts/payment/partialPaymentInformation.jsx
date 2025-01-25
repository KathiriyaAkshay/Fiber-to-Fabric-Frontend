import React, { useContext, useEffect, useState } from "react";
import { Modal, Table, Button, Flex, Tooltip, Tag, Spin } from "antd";
import { DollarOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { particularBillPartPaymentRequest } from "../../../api/requests/accounts/payment";
import moment from "moment";

const   PartialPaymentInformation = ({bill_id, bill_model, paid_amount}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {companyId} = useContext(GlobalContext) ; 

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // ========== Columns information ================= // 
    const columns = [
        {
            title: 'No.',
            dataIndex: 'key',
            key: 'key',
            render: (text, record, index) => {
                return(
                    <div>
                        {index + 1  }
                    </div>
                )
            }
        },
        {
            title: 'Part amount date',
            dataIndex: 'date',
            key: 'date',
            render: (text, record) => {
                return(
                    <div>
                        {moment(record?.createdAt).format("DD-MM-YYYY")}
                    </div>
                )
            }
        },
        {
            title: 'Part amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (text, record) => {
                return(
                    <div>
                        {record?.amount}
                    </div>
                )
            }
        },
        {
            title: "Paid Amount", 
            dataIndex: "paid_amount", 
            return: (text, record) => {
                    
            }
        },
        {
            title: 'Purchase return',
            dataIndex: 'return',
            key: 'return',
            render: (text, record) => {
                return(
                    <div>---</div>
                )
            }
        },
        {
            title: 'Bank',
            dataIndex: 'bank',
            key: 'bank',
        },
        {
            title: 'Cheque no.',
            dataIndex: 'chequeNo',
            key: 'chequeNo',
        },
        {
            title: "Voch No", 
            dataIndex: "vochNo"
        },
        {
            title: 'Payment date',
            dataIndex: 'paymentDate',
            key: 'paymentDate',
            render: (text, record) => {
                return(
                    <div>
                        {moment(record?.createdAt).format("DD-MM-YYYY")}
                    </div>
                )
            }
        },
        {
            title: 'Payment status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color = "green">
                    PAID
                </Tag>
            ),
        },
    ];

    // ===== Get particular bill payment related data information ====== // 
    const { data: billPaymentData, isLoading, refetch } = useQuery({
        queryKey: ["account/bill/payments/list", { company_id: companyId }],
        queryFn: async () => {
            const res = await particularBillPartPaymentRequest({
                id: bill_id,
                params: {
                    company_id: companyId,
                    model: bill_model
                },
            });
            return res?.data?.data;
        },
        enabled: false, // Disabled by default, we'll trigger it manually
    });

    const handleOpenModal = async () => {
        setIsModalOpen(true);
        await refetch({ queryKey: ["account/bill/payments/list", { company_id: companyId}] }); // Manually refetch the query
    };

    // ================= Bank Transaction information ====================== // 
    const [bannkTransaction, setBankTransaction] = useState([]) ; 

    useEffect(() => {
        if (billPaymentData?.billPaymentDetails?.rows?.length > 0){
            let items = [] ; 
            billPaymentData?.billPaymentDetails?.rows?.map((element) => {
                let temp = {} ; 
                temp["date"] = moment(element?.createdAt).format("DD-MM-YYYY"); 
                temp["amount"] = element?.part_payment ; 
                temp["paid_amount"] = element?.paid_amount ; 
                temp["bank"] = element?.bill_payment_detail?.company_bank_detail?.bank_name ;  
                temp["chequeNo"] = element?.bill_payment_detail?.cheque_no ; 
                temp["vochNo"] = element?.bill_payment_detail?.voucher_no ; 
                temp["paymentDate"] = moment(element?.bill_payment_detail?.cheque_date).format("DD-MM-YYYY") ; 
                items.push(temp) ; 
            })
            setBankTransaction(items) ; 
        }
    }, [billPaymentData])

    return (
        <>
            <div
                style={{
                    cursor: "pointer",
                }}
                onClick={handleOpenModal}
            >   
                <Flex style={{
                    gap: 4, 
                    marginTop: 3
                }}>
                    <Tooltip title = {parseFloat(paid_amount) !== 0?`Paid amount : ${paid_amount}`:""}>
                        <div style={{ fontSize: '18px', color: 'green' }}>
                            <DollarOutlined />
                        </div>
                        <div
                            style={{
                                color: "blue",
                                fontSize: 8,
                                fontWeight: 600,
                            }}
                        >
                            Part Payment
                            {parseFloat(paid_amount) !== 0 && (
                                <div style={{fontSize: 10, color: "green"}}>
                                    {`₹${parseFloat(paid_amount).toFixed(2)}/-`}
                                </div>
                            )}
                        </div>
                    </Tooltip>
                </Flex>
            </div>

            <Modal
                title="Bill Part Payment"
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="close" type="primary" danger onClick={handleCloseModal}>
                        CLOSE
                    </Button>,
                ]}
                className="view-in-house-quality-model"
                classNames={{
                    header: "text-center",
                }}
                styles={{
                    content: {
                        padding: 0,
                        width: "fit-content",
                        margin: "auto",
                    },
                    header: {
                        padding: "16px",
                        margin: 0,
                    },
                    body: {
                        padding: "10px 16px",
                    },

                    footer: {
                        paddingBottom: "10px", 
                        paddingRight: "10px"
                    }
                }}
                centered
            >
                <Spin spinning = {isLoading}>
                    <Table
                        columns={columns}
                        dataSource={bannkTransaction}
                        pagination={false}
                        loading = {isLoading}
                        // footer={() => (
                        //     <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                        //         Total 22400 0
                        //     </div>
                        // )}
                    />
                </Spin>
            </Modal>
        </>
    );
};

export default PartialPaymentInformation;