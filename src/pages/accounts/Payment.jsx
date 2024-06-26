import { CreditCardOutlined, EyeOutlined, PlusCircleOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Radio, Space, Table, Row, Col, Form, Select, DatePicker, Modal, Descriptions, Flex } from 'antd'
import React from 'react'
import { useState } from 'react'

const Payment = () => {
    const [form] = Form.useForm();

    const formItemLayout = {
        labelAlign: "left",
        labelCol: { span: 24 },
        wrapperCol: { span: 20 }
    };
    const handleChange = (value) => {
        console.log(`selected ${value}`);
    };

    //DATE PICKER
    const onChange = (date, dateString) => {
        console.log(date, dateString);
    };

    const [PaymentFilter, setPaymentFilter] = useState('Bill');

    const onChange1 = ({ target: { value } }) => {
        setPaymentFilter(value);
    };

    const plainOptions = ['Bill', 'Passbook Update', 'Cashbook Update'];

    const columns = [
        {
            title: 'No.',
            dataIndex: 'no',
            key: 'no',
        },
        {
            title: 'Supplier Name',
            dataIndex: 'supplier_name',
            key: 'supplier_name',
        },
        {
            title: 'Account Name',
            dataIndex: 'account_name',
            key: 'account_name',
        },
        {
            title: 'Company Name',
            dataIndex: 'company_name',
            key: 'company_name',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
        },
        {
            title: 'Voucher No.',
            dataIndex: 'voucher_no',
            key: 'voucher_no',
        },
        {
            title: 'Voucher Date.',
            dataIndex: 'voucher_date',
            key: 'voucher_date',
        },
        {
            title: 'Cheque No.',
            dataIndex: 'cheque_no',
            key: 'cheque_no',
        },
        {
            title: 'Cheque Date',
            dataIndex: 'cheque_date',
            key: 'cheque_date',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EyeOutlined />} onClick={() => showModal()} />
                    <Button icon={<CreditCardOutlined />} onClick={()=>showChequeBookModal()} />
                </Space>
            ),
        },

    ];

    const dataSource = [
        {
            no: "1",
        },

    ]

    function renderTable() {
        // if (isLoading) {
        //   return (
        //     <Spin tip="Loading" size="large">
        //       <div className="p-14" />
        //     </Spin>
        //   );
        // }

        return (
            <Table
                dataSource={dataSource || []}
                columns={columns}
                rowKey={"id"}
                scroll={{ y: 330 }}
                pagination={{
                    total: 0,
                    showSizeChanger: true,
                    //   onShowSizeChange: onShowSizeChange,
                    //   onChange: onPageChange,
                }}
            />
        );
    }


    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const [ChequeBookModal, setChequeBookModalOpen] = useState(false);
    const showChequeBookModal = () => {
        setChequeBookModalOpen(true);
    };
    const handleChequeBookOk = () => {
        setChequeBookModalOpen(false);
    };
    const handleChequeBookCancel = () => {
        setChequeBookModalOpen(false);
    };

    const dataSourcePayment = [
        {
            no: "1",
        },

    ]

    const columnsPayment = [
        {
            title: 'No.',
            dataIndex: 'no',
            key: 'no',
        },
        {
            title: 'Bill no',
            dataIndex: 'bill_no',
            key: 'bill_no',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Bill Amount',
            dataIndex: 'bill_amount',
            key: 'bill_amount',
        },
        {
            title: 'Net Amount',
            dataIndex: 'net_amount',
            key: 'net_amount',
        },
        {
            title: 'Bill Date',
            dataIndex: 'bill_date',
            key: 'bill_date',
        },
        {
            title: 'Due Days',
            dataIndex: 'due_days',
            key: 'due_days',
        },
        {
            title: 'Less',
            dataIndex: 'less',
            key: 'less',
        },
        {
            title: 'Plus',
            dataIndex: 'plus',
            key: 'plus',
        },

    ];




    function renderPaymentTable() {
        // if (isLoading) {
        //   return (
        //     <Spin tip="Loading" size="large">
        //       <div className="p-14" />
        //     </Spin>
        //   );
        // }

        return (
            <Table
                dataSource={dataSourcePayment || []}
                columns={columnsPayment}
                rowKey={"id"}
                className='mt-3'
                scroll={{ y: 330 }}
                pagination={{
                    total: 0,
                    showSizeChanger: true,
                    //   onShowSizeChange: onShowSizeChange,
                    //   onChange: onPageChange,
                }}
                summary={(tableData) => {



                    return (
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0}>
                                <b>Total</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b>1</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}></Table.Summary.Cell>

                            <Table.Summary.Cell index={0}><b>1123</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b>1124513</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}></Table.Summary.Cell>

                            <Table.Summary.Cell index={1}>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1}>
                            </Table.Summary.Cell>

                        </Table.Summary.Row>
                    );
                }}
            />
        );
    }



    return (
        <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between gap-5 mx-3 mb-3">

                <div className="flex items-center gap-5">
                    <h3 className="m-0 text-primary">Payments</h3>
                    <Button onClick={""} icon={<PlusCircleOutlined />} />
                </div>
                <div>
                    <Radio.Group options={plainOptions} onChange={onChange1} value={PaymentFilter} />

                </div>

            </div>
            <div>
                <Form
                    form={form}
                    style={{ maxWidth: "100%" }}
                    layout='vertical'
                // style={{
                //     maxWidth: formLayout === 'inline' ? 'none' : 600,
                // }}
                >

                    <Row className='w-100' justify={"start"}>
                        <Col span={4}>
                            <Form.Item label="Company" {...formItemLayout}>
                                <Select
                                    defaultValue="looms"
                                    style={{
                                        width: "100%",
                                    }}
                                    onChange={handleChange}
                                    options={[
                                        {
                                            value: 'looms',
                                            label: 'Looms',
                                        },
                                        {
                                            value: 'jacquard',
                                            label: 'Jacquard',
                                        },

                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item label="Bank" {...formItemLayout}>
                                <Select
                                    defaultValue="looms"
                                    style={{
                                        width: "100%",
                                    }}
                                    onChange={handleChange}
                                    options={[
                                        {
                                            value: 'looms',
                                            label: 'Looms',
                                        },
                                        {
                                            value: 'jacquard',
                                            label: 'Jacquard',
                                        },

                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item label="Supplier" {...formItemLayout}>
                                <Select
                                    defaultValue="looms"
                                    style={{
                                        width: "100%",
                                    }}
                                    onChange={handleChange}
                                    options={[
                                        {
                                            value: 'looms',
                                            label: 'Looms',
                                        },
                                        {
                                            value: 'jacquard',
                                            label: 'Jacquard',
                                        },

                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item label="Cheque Date" {...formItemLayout}>
                                <DatePicker />

                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item label="Voucher Date" {...formItemLayout}>
                                <DatePicker />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item {...formItemLayout}>
                                <Button icon={<SearchOutlined />} type="primary" />
                            </Form.Item>
                        </Col>


                    </Row>

                </Form>
            </div>
            {renderTable()}

            <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} width={"100%"}>

                <div className='font-semibold text-lg mb-3'>
                    Payment Voucher Details
                </div>
                <Row>
                    <Col span={6}>
                        <Flex justify='center'>
                            <div className="w-1/2 text-left font-semibold">Voucher Name</div>
                            <div className="w-1/2 text-left">v-06</div>
                        </Flex>

                    </Col>
                    <Col span={6}>
                        <Flex justify='space-evenly'>
                            <div className="w-1/2 text-left font-semibold">Cheque No</div>
                            <div className="w-1/2 text-left">100</div>
                        </Flex>

                    </Col> <Col span={6}>
                        <Flex justify='space-evenly'>
                            <div className="w-1/2 text-left font-semibold">Supplier Name</div>
                            <div className="w-1/2 text-left">Power</div>
                        </Flex>

                    </Col> <Col span={6}>
                        <Flex justify='space-evenly'>
                            <div className="w-1/2 text-left font-semibold">Company Name</div>
                            <div className="w-1/2 text-left">Sonu Textiles</div>
                        </Flex>
                    </Col>
                </Row>
                <Row className='mt-2'>
                    <Col span={6}>
                        <Flex justify='center'>
                            <div className="w-1/2 text-left font-semibold">Voucher Date</div>
                            <div className="w-1/2 text-left">26/02/23</div>
                        </Flex>

                    </Col>
                    <Col span={6}>
                        <Flex justify='space-evenly'>
                            <div className="w-1/2 text-left font-semibold">Cheque Date</div>
                            <div className="w-1/2 text-left">26/02/23</div>
                        </Flex>

                    </Col> <Col span={6}>
                        <Flex justify='space-evenly'>
                            <div className="w-1/2 text-left font-semibold">Account Name</div>
                            <div className="w-1/2 text-left">Power</div>
                        </Flex>

                    </Col> <Col span={6}>
                        <Flex justify='space-evenly'>
                            <div className="w-1/2 text-left font-semibold">Bank Name</div>
                            <div className="w-1/2 text-left">Sonu Textiles</div>
                        </Flex>
                    </Col>
                </Row>
                <Row className='mt-2'>
                    <Col span={6}>
                        <Flex justify='center'>
                            <div className="w-1/2 text-left font-semibold">Amount</div>
                            <div className="w-1/2 text-left">45325.32</div>
                        </Flex>

                    </Col>

                </Row>
                {renderPaymentTable()}
            </Modal>

            <Modal open={ChequeBookModal} onOk={handleChequeBookOk} onCancel={handleChequeBookCancel} width={"70%"} footer={[]}>
            <div className='font-semibold text-lg mb-3'>
                    Cheque
                </div>

                <img src={"https://placehold.co/1000x400"}/>

                <Flex justify='flex-end' className='gap-1'>

                <Button>Print</Button>
                <Button danger onClick={handleChequeBookCancel}>Close</Button>

                </Flex>

            </Modal>
        </div>
    )
}

export default Payment