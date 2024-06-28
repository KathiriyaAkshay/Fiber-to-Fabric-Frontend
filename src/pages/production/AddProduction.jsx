import React, { useState } from 'react'
import { Button, Radio, Table, Form, Input, Select, Row, Col, DatePicker, Flex, Checkbox } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
const AddProduction = () => {
    const [ProdFilter, setProdFilter] = useState('Quality Wise');
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
    const onChange1 = ({ target: { value } }) => {
        setProdFilter(value);
    };

    const plainOptions = ['Quality Wise', 'Machine Wise', 'Multi Machine Wise'];
    const options = [
        {
            label: 'Quality Wise',
            value: 'Quality Wise',
        },
        {
            label: 'Machine Wise',
            value: 'Machine Wise',
        },
        {
            label: 'Multi Machine Wise',
            value: 'Multi Machine Wise',
        },
    ];

    const columns = [
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
            title: 'Weight',
            dataIndex: 'weight',
            key: 'weight',
        },
        {
            title: 'Machine No.',
            dataIndex: 'machine_no',
            key: 'machine_no',
        },
        {
            title: 'Average',
            dataIndex: 'average',
            key: 'average',
        },
        {
            title: 'Beam No.',
            dataIndex: 'beam_no',
            key: 'beam_no',
        },
        {
            title: 'Prod.Mtr',
            dataIndex: 'prod_mtr',
            key: 'prod_mtr',
        },
        {
            title: 'Pend.Mtr',
            dataIndex: 'pend_mtr',
            key: 'pend_mtr',
        },
        {
            title: 'Pend %',
            dataIndex: 'pend',
            key: 'pend',
        },
        {
            title: "icon",
            dataIndex: 'icon',
            key: 'icon',
        },

    ];

    const dataSource = [
        {
            taka_no: "1",
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
                            <Table.Summary.Cell index={0}></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}><b>0</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}></Table.Summary.Cell>
                            <Table.Summary.Cell index={0}></Table.Summary.Cell>
                        </Table.Summary.Row>
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
    return (
        <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between gap-5 mx-3 mb-3">

                <div className="flex items-center gap-5">
                    <h3 className="m-0 text-primary">Add Production</h3>
                    <Button onClick={""} icon={<PlusCircleOutlined />} />
                </div>
                <div>
                    <Radio.Group options={plainOptions} onChange={onChange1} value={ProdFilter} />
                    {ProdFilter == "Machine Wise" ?
                        <>
                            <Checkbox> Generate QR Code</Checkbox>
                        </>
                        :
                        <></>
                    }
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
                        <Col span={8}>
                            <Form.Item label="Machine" {...formItemLayout}>
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

                        {ProdFilter != "Multi Machine Wise" ?
                            <Col span={8}>
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
                            : <></>}


                        <Col span={8}>
                            <Form.Item label="Date" {...formItemLayout}>
                                <DatePicker onChange={onChange} className='w-100' style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>


                    </Row>


                    <Row style={{ width: "100%" }} className='w-100' justify={"start"}>

                        {ProdFilter == "Machine Wise" ?
                            <Col span={8}>
                                <Form.Item label="M. No" {...formItemLayout}>
                                    <Select
                                        defaultValue="1"
                                        style={{
                                            width: "100%",
                                        }}
                                        onChange={handleChange}
                                        options={[
                                            {
                                                value: '1',
                                                label: '1',
                                            },
                                            {
                                                value: '2',
                                                label: '2',
                                            },

                                        ]}
                                    />
                                </Form.Item>
                            </Col>
                            :
                            <>
                            </>}
                        <Col span={8}>
                            <Form.Item label="Last Entered Taka No." {...takaLayout}>
                                <Row >
                                    <Col span={8}>
                                        <Input />
                                    </Col>
                                    <Col span={10}>
                                        <Input />
                                    </Col>
                                </Row>
                            </Form.Item>
                        </Col>

                        <Col span={ProdFilter == "Machine Wise" ? 8 : 16}>
                            <Flex justify='flex-end'>
                                <Form.Item>
                                    <Button type="primary">Back</Button>
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

export default AddProduction;