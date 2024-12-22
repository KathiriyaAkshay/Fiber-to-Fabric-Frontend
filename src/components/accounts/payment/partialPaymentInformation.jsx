import React, { useContext, useState } from "react";
import { Modal, Table, Button, Flex, Tooltip } from "antd";
import { DollarOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { particularBillPartPaymentRequest } from "../../../api/requests/accounts/payment";

const PartialPaymentInformation = ({bill_id, bill_model, paid_amount}) => {
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
        },
        {
            title: 'Part amount date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Part amount',
            dataIndex: 'amount',
            key: 'amount',
        },
        {
            title: 'Purchase return',
            dataIndex: 'return',
            key: 'return',
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
            title: 'Payment date',
            dataIndex: 'paymentDate',
            key: 'paymentDate',
        },
        {
            title: 'Payment status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span style={{ color: status === 'Paid' ? 'green' : 'red' }}>{status}</span>
            ),
        },
        {
            title: 'Cheque Image',
            dataIndex: 'chequeImage',
            key: 'chequeImage',
        },
    ];

    const data = [
        {
            key: '1',
            date: '21-08-2024',
            amount: 22289,
            return: 0,
            bank: 'MESHANA URBAN',
            chequeNo: '121212',
            paymentDate: '21-08-2024',
            status: 'Paid',
            chequeImage: 'N/A'
        },
        {
            key: '2',
            date: '21-08-2024',
            amount: 111,
            return: 0,
            bank: '--',
            chequeNo: '--',
            paymentDate: '--',
            status: 'Unpaid',
            chequeImage: 'N/A'
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
                    dataSource={data}
                    pagination={false}
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