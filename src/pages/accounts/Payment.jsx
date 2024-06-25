import { CreditCardOutlined, EyeOutlined, PlusCircleOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Radio, Space, Table, Row, Col, Form, Select, DatePicker } from 'antd'
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
                    <Button icon={<EyeOutlined />} />
                    <Button icon={<CreditCardOutlined />} />
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
                            <DatePicker/>

                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item label="Voucher Date" {...formItemLayout}>
                                <DatePicker/>
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
        </div>
    )
}

export default Payment