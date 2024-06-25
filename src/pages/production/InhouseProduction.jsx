import React, { useState } from 'react'
import { Button, Radio, Table, Form, Input, Select, Row, Col, DatePicker, Flex, Divider, Space, Modal } from 'antd';
import { BarcodeOutlined, DeleteOutlined, EditFilled, EyeFilled, FilePdfFilled, PlusCircleOutlined, PrinterFilled, SearchOutlined } from '@ant-design/icons';
const InhouseProduction = () => {
    const [ProdFilter, setProdFilter] = useState('Current');
    const [ProdFilterTwo, setProdFilterTwo] = useState('Stock');

    const [form] = Form.useForm();

    const formItemLayout = {
        labelAlign: "left",
        labelCol: { span: 4 },
        wrapperCol: { span: 18 }
    };
    const takaLayout = {
        labelAlign: "left",
        labelCol: { span: 8 },
        wrapperCol: { span: 16 }
    };
    const layoutOne = {
        lableWrap: true,
        labelAlign: "left",
        labelCol: { span: 6 },
        wrapperCol: { span: 16 }
    };
    const layoutTwo = {
        lableWrap: true,
        labelAlign: "left",
        labelCol: { span: 7 },
        wrapperCol: { span: 15 }
    };
    const onChange1 = ({ target: { value } }) => {
        setProdFilter(value);
    };
    const onChange2 = ({ target: { value } }) => {
        setProdFilterTwo(value);
    };

    const plainOptions = ['Current', 'Previous'];
    const plainOptionsFilter = ['Sold', 'Stock', 'TP', 'Re-Work', 'All'];


    const columns = [

        {
            title: 'No',
            dataIndex: 'no',
            key: 'no',
        },
        {
            title: 'Taka No.',
            dataIndex: 'taka_no',
            key: 'taka_no',
        },
        {
            title: 'Meter',
            dataIndex: 'meter',
            key: 'meter',
        },
        {
            title: 'Weight',
            dataIndex: 'weight',
            key: 'weight',
        },
        {
            title: 'Machine No',
            dataIndex: 'machine_no',
            key: 'machine_no',
        },
        {
            title: 'Average',
            dataIndex: 'average',
            key: 'average',
        },
        {
            title: 'Meter',
            dataIndex: 'meter',
            key: 'meter',
        },
        {
            title: 'Quality',
            dataIndex: 'quality',
            key: 'quality',
        },
        {
            title: 'Action',
            key: 'action',
            width: "14%",
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EyeFilled />} onClick={()=>showModal()}/>
                    <Button icon={<EditFilled />} />
                    <Button icon={<BarcodeOutlined />} />
                    <Button icon={<DeleteOutlined />} />

                </Space>

            ),
        },

    ];

    const dataSource = [{
        taka_no: "1",
    }
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
                rowSelection={{
                    type: selectionType,
                    ...rowSelection,
                }}
            />
        );
    }

    //OPTIONS
    const handleChange = (value) => {
        console.log(`selected ${value}`);
    };

    //DATE PICKER
    const onChange = (date, dateString) => {
        console.log(date, dateString);
    };
    const [selectionType, setSelectionType] = useState('checkbox');
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
        getCheckboxProps: (record) => ({
            disabled: record.name === 'Disabled User',
            // Column configuration not to be checked
            name: record.name,
        }),
    };

    //show modal

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
    return (
        <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between gap-5 mx-3 mb-3">

                <div className="flex items-center gap-5">
                    <h3 className="m-0 text-primary">In House Production</h3>
                    <Button onClick={""} icon={<PlusCircleOutlined />} />
                </div>
                <div>
                    <Radio.Group options={plainOptions} onChange={onChange1} value={ProdFilter} />

                </div>

            </div>

            <div>
                <Form
                    form={form}
                    style={{ maxWidth: "100%" }}
                // style={{
                //     maxWidth: formLayout === 'inline' ? 'none' : 600,
                // }}
                >

                    <Row className='w-100' justify={"start"}>
                        <Col span={6}>
                            <Form.Item label="Type" {...formItemLayout}>
                                <Select
                                    defaultValue="Select Type"
                                    style={{
                                        width: "100%",
                                    }}
                                    onChange={handleChange}
                                    options={[
                                        {
                                            value: 'Taka(in House)',
                                            label: 'Taka(in House)',
                                        },
                                        {
                                            value: 'Purchase/Trading',
                                            label: 'Purchase/Trading',
                                        },

                                    ]}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item label="Quality" {...formItemLayout}>
                                <Select
                                    defaultValue="Select Quality Name"
                                    style={{
                                        width: "100%",
                                    }}
                                    onChange={handleChange}
                                    options={[
                                        {
                                            value: 'wl',
                                            label: 'WEIGHTLESS - (6.5 KG)',
                                        },
                                        {
                                            value: '33p',
                                            label: '33P PALLU PATTERN - (8 KG)',
                                        },

                                    ]}
                                />
                            </Form.Item>
                        </Col>



                        <Col span={6}>
                            <Form.Item label="Date" {...formItemLayout}>
                                <DatePicker onChange={onChange} className='w-100' style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="To" {...formItemLayout}>
                                <DatePicker onChange={onChange} className='w-100' style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>


                    </Row>


                    <Row style={{ width: "100%" }} className='w-100' justify={"start"}>

                        <Col span={6}>
                            <div className=''>
                                <Radio.Group options={plainOptionsFilter} onChange={onChange2} value={ProdFilterTwo} />
                            </div>
                        </Col>

                        <Col span={6}>
                            <Flex>
                                <Form.Item label="From" {...layoutOne}>
                                    <Input placeholder='Taka No.' />
                                </Form.Item>
                                <Form.Item label="To" {...layoutOne}>
                                    <Input placeholder='Taka No.' />
                                </Form.Item>
                            </Flex>

                        </Col>
                        <Col span={6}>
                            <Flex>
                                <Form.Item label="From" {...layoutOne}>
                                    <Input placeholder='Machine No.' />
                                </Form.Item>
                                <Form.Item label="To" {...layoutOne}>
                                    <Input placeholder='Machine No.' />
                                </Form.Item>
                            </Flex>

                        </Col>

                        <Col span={5}>

                            <Form.Item label="Beam No." {...layoutOne}>
                                <Input placeholder='Beam No.' className='w-100' />
                            </Form.Item>

                        </Col>
                        <Col span={1}>
                            <Button icon={<SearchOutlined />}>
                            </Button>

                        </Col>
                    </Row>




                </Form>
            </div>
            <Row className='w-100' justify={"start"}>
                <Col span={6}>
                    <Form.Item label="Challan No." {...layoutTwo}>
                        <Input placeholder='Challan No.' className='w-100' />

                    </Form.Item>
                </Col>

                <Col span={18}>

                    <Row className='w-100' justify={"end"}>
                        <Col span={8}>
                            <Form.Item label="Grade" {...formItemLayout}>
                                <Flex>
                                    <Select
                                        defaultValue="Select Grade"
                                        style={{
                                            width: "100%",
                                        }}
                                        onChange={handleChange}
                                        options={[
                                            {
                                                value: 'Taka(in House)',
                                                label: 'Taka(in House)',
                                            },
                                            {
                                                value: 'Purchase/Trading',
                                                label: 'Purchase/Trading',
                                            },

                                        ]}
                                    />
                                    <Select
                                        defaultValue="Select Folding User"
                                        style={{
                                            width: "100%",
                                        }}
                                        onChange={handleChange}
                                        options={[
                                            {
                                                value: 'Taka(in House)',
                                                label: 'Taka(in House)',
                                            },
                                            {
                                                value: 'Purchase/Trading',
                                                label: 'Purchase/Trading',
                                            },

                                        ]}
                                    />
                                </Flex>
                            </Form.Item>
                        </Col>

                        <Col>
                            <Button icon={<FilePdfFilled />} />
                        </Col>
                        <Col>
                            <Button icon={<PrinterFilled />} />
                        </Col>
                        <Col>
                            <Button>Summary</Button>
                        </Col>





                    </Row>

                </Col>


            </Row>




            {renderTable()}


            <Modal title="" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <p>Some contents...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Modal>

        </div>
    )
}

export default InhouseProduction;