import React, { useState } from 'react'
import { Button, Radio, Table, Form, Input, Select, Row, Col, DatePicker, Flex, Divider, Space, Modal, Descriptions, Badge, Tag } from 'antd';
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
                    <Button icon={<EyeFilled />} onClick={() => showModal()} />
                    <Button icon={<EditFilled />} />
                    <Button icon={<BarcodeOutlined />} onClick={() => showQrModal()} />
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
                summary={(tableData) => {
                    let totalPendingTaka = 0;
                    let totalDeliveredTaka = 0;
                    let totalPendingMeter = 0;
                    let totalDeliveredMeter = 0;


                    return (
                        <>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0}>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b>Total</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b></b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b>0</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b>0</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}></Table.Summary.Cell>

                            <Table.Summary.Cell index={0}><b>0</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}></Table.Summary.Cell>
                        </Table.Summary.Row>
                        <Table.Summary.Row>
                        <Table.Summary.Cell index={0}>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={0}><b>Grand Total</b></Table.Summary.Cell>
                        <Table.Summary.Cell index={0}><b></b></Table.Summary.Cell>
                        <Table.Summary.Cell index={0}><b>0</b></Table.Summary.Cell>
                        <Table.Summary.Cell index={0}><b>0</b></Table.Summary.Cell>
                        <Table.Summary.Cell index={0}></Table.Summary.Cell>

                        <Table.Summary.Cell index={0}><b>0</b></Table.Summary.Cell>
                        <Table.Summary.Cell index={0}></Table.Summary.Cell>
                        <Table.Summary.Cell index={0}></Table.Summary.Cell>
                        <Table.Summary.Cell index={0}></Table.Summary.Cell>
                    </Table.Summary.Row>
                    </>
                    );
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

    //show QR modal

    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const showQrModal = () => {
        setIsQrModalOpen(true);
    };
    const handleQrOk = () => {
        setIsQrModalOpen(false);
    };
    const handleQrCancel = () => {
        setIsQrModalOpen(false);
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

    const items = [
        {
            key: '1',
            label: 'Quality Name',
            children: '33P PALLU PATERN (SDFSDFSDFSDFSDFSD) - (8KG)',
            span: 2,

        },
        {
            key: '2',
            label: 'Order Type',
            children: 'Sale',
            span: 2,
        },
        {
            key: '3',
            label: 'Production Company Name',
            children: 'SONU TEXTILES',
            span: 2,
        },
        {
            key: '4',
            label: 'Beam status',
            children: 'Finished',
            span: 2,

        },

        {
            key: '5',
            label: 'Date',
            children: '2019-04-24 18:00:00',
            span: 2,
        },
        {
            key: '6',
            label: 'P Taka',
            children: '--',
            span: 2,
        },
        {
            key: '7',
            label: 'Return Sale Challan No',
            children: '--',
            span: 2,
        },
        {
            key: '8',
            label: 'Prod Taka',
            children: '--',
            span: 2,
        },
        {
            key: '9',
            label: 'Taka No',
            children: '9',
            span: 2,
        },
        {
            key: '10',
            label: 'Prod Mtr',
            children: '23',
            span: 2,
        },
        {
            key: '11',
            label: 'Meter',
            children: '1023',
            span: 2,
        },
        {
            key: '12',
            label: 'Pend mtr',
            children: '--',
            span: 2,
        },
        {
            key: '13',
            label: 'Weight',
            children: '840.09',
            span: 2,
        },
        {
            key: '14',
            label: 'Purchase Challan No.',
            children: '--',
            span: 2,
        },
        {
            key: '15',
            label: 'Average',
            children: '82.12',
            span: 2,
        },
        {
            key: '16',
            label: 'Supplier Name',
            children: '--',
            span: 2,
        },
        {
            key: '17',
            label: 'Old Meter',
            children: '1023',
            span: 2,
        },
        {
            key: '18',
            label: 'Purchase Company Name',
            children: '--',
            span: 2,
        },
        {
            key: '19',
            label: 'Old Weight',
            children: '840.09',
            span: 2,
        },
        {
            key: '20',
            label: 'Sale Challan Company Name',
            children: '--',
            span: 2,
        },
        {
            key: '21',
            label: 'Old Average',
            children: '82.12',
            span: 2,
        },
        {
            key: '22',
            label: 'Challan No',
            children: '1023',
            span: 2,
        },
        {
            key: '23',
            label: 'Machine No',
            children: '4',
            span: 2,
        },
        {
            key: '24',
            label: 'Party',
            children: '--',
            span: 2,
        },
    ];


    const columnsModal = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Employee Name',
            dataIndex: 'employee_name',
            key: 'employee_name',
        },
        {
            title: 'Meter',
            dataIndex: 'meter',
            key: 'meter',
        },
        {
            title: 'Taka No',
            key: 'taka_no',
            dataIndex: 'taka_no',
        },
        {
            title: 'Machine No',
            key: 'machine_no',
            dataIndex: 'machine_no',
        },
        {
            title: 'Beam No',
            key: 'beam_no',
            dataIndex: 'beam_no',
        },
    ];
    const data = [
        {
            key: '1',
            date: '11-1-11',
            employee_name: "John",
            meter: '',
            taka_no: '',
            machine_no: '',
            beam_no: '',
        },
    ];

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


            <Modal title="" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} width="100%">
                <Descriptions title="Production Details" bordered items={items} size='small' />

                <div className='text-center' style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                    Employee Avg. Report
                </div>
                <Table columns={columnsModal} dataSource={data} />
            </Modal>

            <Modal title="" open={isQrModalOpen} onOk={handleQrOk} onCancel={handleQrCancel} width="50%">

                <Flex>
                    <img
                        width={200}
                        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                    />
                    <div className='ms-2'>
                        <Descriptions title="">
                            <Descriptions.Item label="Taka" span={3}>Zhou Maomao</Descriptions.Item>
                            <Descriptions.Item label="Meter" span={3}>Zhou Maomao</Descriptions.Item>
                            <Descriptions.Item label="M.N." span={3}>Zhou Maomao</Descriptions.Item>
                            <Descriptions.Item label="Q" span={3}>Zhou Maomao</Descriptions.Item>
                        </Descriptions>
                        <Button type='primary'>Print</Button>
                    </div>

                </Flex>

            </Modal>

        </div>
    )
}

export default InhouseProduction;