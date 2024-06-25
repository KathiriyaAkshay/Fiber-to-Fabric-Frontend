import React from 'react'
import { useState } from 'react'
import { Button, Checkbox, Col, Flex, Radio, Row, Form, Select, Input, Space,Table } from 'antd'
import { EyeFilled, LineOutlined, PlusCircleOutlined } from '@ant-design/icons'
const OpenProduction = () => {
    const [form] = Form.useForm();
    const [ProdFilter, setProdFilter] = useState('Current');

    const onChange1 = ({ target: { value } }) => {
        setProdFilter(value);
    };

    const formItemLayout = {
        labelWrap: true,
        labelCol: { span: 8 },
        wrapperCol: { span: 16 }
    };

    const plainOptions = ['Current year', 'Previous year'];

    //OPTIONS
    const handleChange = (value) => {
        console.log(`selected ${value}`);
    };

    const dataSource=[];

    const columns=[
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
            title: <LineOutlined/>,
            dataIndex: 'average',
            key: 'average',
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
                    <h3 className="m-0 text-primary">Opening Production</h3>
                    <Button onClick={""} icon={<PlusCircleOutlined />} />
                </div>
                <div>

                    <Checkbox className='pe-6'>
                        Challan
                    </Checkbox>
                    <Radio.Group options={plainOptions} onChange={onChange1} value={ProdFilter} />

                </div>

            </div>


            <Form
                form={form}
                style={{ maxWidth: "100%" }}
                labelWrap
            // style={{
            //     maxWidth: formLayout === 'inline' ? 'none' : 600,
            // }}
            >

                <Row style={{ width: "100%" }}>
                    <Col span={12}>

                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    label="Company"
                                    name="company"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input your company!',
                                        },
                                    ]}
                                >
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

                            <Col span={12}>
                                <Form.Item
                                    label="GST State"
                                    name="gst_state"
                                    {...formItemLayout}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="GSTIN"
                                    name="gstin"
                                    {...formItemLayout}

                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input your GSTIN!',
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Order No"
                                    name="order no."
                                    {...formItemLayout}

                                >
                                    <Space.Compact
                                        style={{
                                            width: '100%',
                                        }}
                                    >
                                        <Input placeholder="Order No" />
                                        <Button type="primary" icon={<EyeFilled />}></Button>
                                    </Space.Compact>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Broker"
                                    name="broker"
                                    {...formItemLayout}

                                >
                                    <Input placeholder='broker name' />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Party"
                                    name="party"
                                    {...formItemLayout}

                                >
                                    <Space.Compact
                                        style={{
                                            width: '100%',
                                        }}
                                    >
                                        <Select
                                            defaultValue="Cisco1"
                                            style={{
                                                width: "100%",
                                            }}
                                            onChange={handleChange}
                                            options={[
                                                {
                                                    value: 'Cisco1',
                                                    label: 'Cisco1',
                                                },
                                                {
                                                    value: 'Cisco2',
                                                    label: 'Cisco2',
                                                },

                                            ]}
                                        />
                                        <Button type="primary" icon={<PlusCircleOutlined />}></Button>
                                    </Space.Compact>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Company"
                                    name="comany"
                                    {...formItemLayout}

                                >
                                    <Select
                                        defaultValue="Cisco1"
                                        style={{
                                            width: "100%",
                                        }}
                                        onChange={handleChange}
                                        options={[
                                            {
                                                value: 'Cisco1',
                                                label: 'Cisco1',
                                            },
                                            {
                                                value: 'Cisco223',
                                                label: 'Cisco2342',
                                            },

                                        ]}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="GST State"
                                    name="gst_state"
                                    {...formItemLayout}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="GSTIN"
                                    name="gstin"
                                    {...formItemLayout}

                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input your GSTIN!',
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Last Entered Taka No." {...formItemLayout}>
                                    <Row >
                                        <Col span={8}>
                                            <Input />
                                        </Col>
                                        <Col span={16}>
                                            <Input />
                                        </Col>
                                    </Row>
                                </Form.Item>
                            </Col>

                        </Row>
                    </Col>

                    <Col span={12}>
                        <Row>

                            <Col span={12}>
                                <Form.Item
                                    label="Challan No."
                                    name="challan_no"
                                    {...formItemLayout}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Challan Date"
                                    name="challan_date"
                                    {...formItemLayout}

                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input your GSTIN!',
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={<span>Delivery Address</span>}
                                    name="del_add"
                                    labelWrap
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input your Delivery Address!',
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Qualtity"
                                    name="quality"
                                    {...formItemLayout}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input quality!',
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Vehicle"
                                    name="vehicle"
                                    {...formItemLayout}

                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input vehicle!',
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Total Meter."
                                    name="total_meter"
                                    {...formItemLayout}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Total Weight"
                                    name="total_weight"
                                    {...formItemLayout}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Total taka"
                                    name="total_taka"
                                    {...formItemLayout}

                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input your GSTIN!',
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>

                    </Col>

                </Row>
                <Flex justify='flex-end'>
                    <Button type='primary'>Submit</Button>
                </Flex>
            </Form>


            {renderTable()}

            <Flex justify='flex-end'>
                    <Button type='primary' danger>Back</Button>
                </Flex>


        </div>
    )
}

export default OpenProduction