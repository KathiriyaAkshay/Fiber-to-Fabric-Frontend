import React, { useContext, useEffect, useState } from "react";
import { Modal, Table, Button, Flex, Tooltip, Tag } from "antd";
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
                        {record?.part_payment}
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
            render: (text, record) => {
                return(
                    <div>
                        {record?.bill_payment_detail?.cheque_no}
                    </div>
                )
            }
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

    // ============== Get Particular bill part payment related data =========== 
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
                    <Tooltip title = {paid_amount}>
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
            >
                <Table
                    columns={columns}
                    dataSource={billPaymentData?.billPaymentDetails?.rows || []}
                    pagination={false}
                    loading = {isLoading}
                    footer={() => (
                        <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                            Total 22400 0
                        </div>
                    )}
                />
            </Modal>
        </>
    );
};

export default PartialPaymentInformation;