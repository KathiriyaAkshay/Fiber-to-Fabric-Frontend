import { FileZipOutlined, PlayCircleFilled, PlusCircleFilled, PlusCircleOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Col, DatePicker, Flex, Form, Input, Radio, Row, Select, Table } from 'antd'
import React, { useState } from 'react'

const PurchaseEntryList = () => {

    const [ProdFilter, setProdFilter] = useState('Current Year');
    const [form] = Form.useForm();

    const formItemLayout = {
        labelAlign: "left",
        labelCol: { span: 20 },
        wrapperCol: { span: 20 }
    };
    const onChange1 = ({ target: { value } }) => {
        setProdFilter(value);
    };

    const plainOptions = ['Current Year', 'Previous Year'];

    const columns = [
        {
            title: 'No.',
            dataIndex: 'no',
            key: 'no',
        },
        {
            title: 'Invoice Date',
            dataIndex: 'invoice_date',
            key: 'invoice_date',
        },
        {
            title: 'Invoice No',
            dataIndex: 'invoice_no',
            key: 'invoice_no',
        },
        {
            title: 'Haed',
            dataIndex: 'head',
            key: 'head',
        },
        {
            title: 'Supplier Name',
            dataIndex: 'supplier_name',
            key: 'supplier_name',
        },
        {
            title: 'Supplier Company',
            dataIndex: 'supplier_company',
            key: 'supplier_company',
        },
        {
            title: 'Remark',
            dataIndex: 'remark',
            key: 'remark',
        },
        {
            title: 'Grand Total',
            dataIndex: 'grand_total',
            key: 'grand_total',
        },
        {
            title: 'Due Days',
            dataIndex: 'due_days',
            key: 'due_days',
        },
        {
            title: 'Billing Days',
            dataIndex: 'billing_days',
            key: 'billing_days',
        },
        {
            title: "Status",
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: "Action",
            dataIndex: 'action',
            key: 'action',
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
                summary={(tableData) => {
                    let totalPendingTaka = 0;
                    let totalDeliveredTaka = 0;
                    let totalPendingMeter = 0;
                    let totalDeliveredMeter = 0;


                    return (
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0}>
                                <b>Total</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b>0</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b>0.00</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b>0</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b>0</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b>0</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b>0</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b>0</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b>0</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b>0</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b>0</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b>0</b></Table.Summary.Cell>
                        </Table.Summary.Row>
                    );
                }}

            />
        );
    }

    return (
        <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between gap-5 mx-3 mb-3">
                <div className="flex items-center gap-2">
                    <h3 className="m-0 text-primary">General Purchase Entry List</h3>
                    <Button
                        icon={<PlusCircleOutlined />}
                        type="text"
                    />
                </div>
                <Flex align="center" gap={10}>
                    <Radio.Group onChange={() => onChange1()} value={ProdFilter} options={plainOptions} />
                </Flex>


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
                            <Form.Item label="Purchase Company" {...formItemLayout}>
                                <Select
                                    defaultValue="looms"
                                    style={{
                                        width: "100%",
                                    }}
                                    options={[
                                        {
                                            value: 'Sonu Texttiles',
                                            label: 'Sonu Texttiles',
                                        },
                                        {
                                            value: 'Sonu Traders',
                                            label: 'Sonu Traders',
                                        },

                                    ]}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={4}>
                            <Form.Item label="Supplier" {...formItemLayout}>
                                <Select
                                    defaultValue="Select Supplier"
                                    style={{
                                        width: "100%",
                                    }}
                                    options={[
                                        {
                                            value: 'supplier1',
                                            label: 'supplier1',
                                        }

                                    ]}
                                />
                            </Form.Item>
                        </Col>


                        <Col span={4}>
                            <Form.Item label="Supplier Company" {...formItemLayout}>
                                <Select
                                    defaultValue="Select Supplier Company"
                                    style={{
                                        width: "100%",
                                    }}
                                    options={[
                                        {
                                            value: 'supplierCompany1',
                                            label: 'supplierCompany1',
                                        }

                                    ]}
                                />
                            </Form.Item>
                        </Col>


                        <Col span={4}>
                            <Form.Item label="From" {...formItemLayout}>
                                <DatePicker />
                            </Form.Item>
                        </Col>

                        <Col span={4}>
                            <Form.Item label="To" {...formItemLayout}>
                                <DatePicker />
                            </Form.Item>
                        </Col>

                        <Col span={4}>
                            <Form.Item label="Status" {...formItemLayout}>
                                <Select
                                    defaultValue="Select Payment"
                                    style={{
                                        width: "100%",
                                    }}
                                    options={[
                                        {
                                            value: 'Paid',
                                            label: 'Paid',
                                        },
                                        {
                                            value: 'Unpaid',
                                            label: 'Unpaid',
                                        }

                                    ]}
                                />
                            </Form.Item>
                            
                        </Col>



                    </Row>


                    <Row style={{ width: "100%" }} className='w-100' justify={"start"}>


                        <Col span={24}>
                            <Flex justify='flex-end' className='gap-1'>
                                <Form.Item>
                                    <Button type="primary" icon={<SearchOutlined/>}/>
                                </Form.Item>
                                <Form.Item>
                                <Button type="primary" icon={<FileZipOutlined/>}/>
                                </Form.Item>
                            </Flex>

                        </Col>
                    </Row>




                </Form>
            </div>

            {renderTable()}

        </div>
    )
}

export default PurchaseEntryList