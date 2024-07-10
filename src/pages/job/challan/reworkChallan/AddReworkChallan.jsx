import React, { useContext, useEffect, useRef, useState } from 'react';
import { Table, Select, DatePicker, Button, Input, Space, Flex, Typography, Divider, Tag, Form, Row, Col, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, FileOutlined, PlusCircleOutlined, SearchOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { RangePicker } = DatePicker;

const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};
const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
}) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);
    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
        }
    }, [editing]);
    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({
            [dataIndex]: record[dataIndex],
        });
    };
    const save = async () => {
        try {
            const values = await form.validateFields();
            toggleEdit();
            handleSave({
                ...record,
                ...values,
            });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };
    let childNode = children;
    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{
                    margin: 0,
                }}
                name={dataIndex}
                rules={[
                    {
                        required: true,
                        message: `${title} is required.`,
                    },
                ]}
            >
                <Input ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
        ) : (
            <div
                className="editable-cell-value-wrap"
                style={{
                    paddingRight: 24,
                }}
                onClick={toggleEdit}
            >
                {children}
            </div>
        );
    }
    return <td {...restProps}>{childNode}</td>;
};

const AddReworkChallan = () => {
    const [quality, setQuality] = useState(null);
    const [supplier, setSupplier] = useState(null);
    const [status, setStatus] = useState('Stock');
    const [dateRange, setDateRange] = useState([null, null]);
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();

    const onFinish = (values) => {
        console.log('Form values:', values);
    };

    const [form] = Form.useForm();
    const [data, setData] = useState(Array.from({ length: 48 }, (_, i) => ({
        key: i + 1,
        takaNo: 0,
        meter: 0,
        receivedMeter: 0,
        receivedWeight: 0,
        shortPercentage: 0,
    })));
    const [editingKey, setEditingKey] = useState('');

    const isEditing = (record) => record.key === editingKey;

    const edit = (record) => {
        form.setFieldsValue({ takaNo: '', meter: '', receivedMeter: '', receivedWeight: '', shortPercentage: '', ...record });
        setEditingKey(record.key);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const save = async (key) => {
        try {
            const row = await form.validateFields();
            const newData = [...data];
            const index = newData.findIndex((item) => key === item.key);

            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, { ...item, ...row });
                setData(newData);
                setEditingKey('');
            } else {
                newData.push(row);
                setData(newData);
                setEditingKey('');
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const [count, setCount] = useState(2);
    const handleDelete = (key) => {
        const newData = dataSource.filter((item) => item.key !== key);
        setDataSource(newData);
    };

    const defaultColumns = [
        {
            title: '#',
            dataIndex: 'key',
            width: '5%',
            editable: false,
        },
        {
            title: 'Taka No.',
            dataIndex: 'takaNo',
            width: '20%',
            editable: true,
        },
        {
            title: 'Meter',
            dataIndex: 'meter',
            width: '20%',
            editable: true,
        },
        {
            title: 'Received Meter',
            dataIndex: 'receivedMeter',
            width: '20%',
            editable: true,
        },
        {
            title: 'Received Weight',
            dataIndex: 'receivedWeight',
            width: '20%',
            editable: true,
        },
        {
            title: 'Short(%)',
            dataIndex: 'shortPercentage',
            width: '10%',
            editable: true,
        },
        {
            title: '',
            dataIndex: 'operation',
            render: (_, record) =>
                data.length >= 1 ? (
                    <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
                        <Button icon={<MinusCircleOutlined />} />
                    </Popconfirm>
                ) : null,
        },
    ];

    const handleAdd = () => {
        const newData = {
            key: count,
            name: `Edward King ${count}`,
            age: '32',
            address: `London, Park Lane no. ${count}`,
        };
        setDataSource([...dataSource, newData]);
        setCount(count + 1);
    };
    const handleSave = (row) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        setDataSource(newData);
    };
    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };
    const columns = defaultColumns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave,
            }),
        };
    });

    return (
        <div className="flex flex-col p-4">
            <div className="flex items-center justify-between gap-2">
                <Space>
                    <h3 className="m-0 text-primary">Create Rework Challan</h3>
                </Space>

            </div>
            <div style={{ padding: '24px' }}>
                <Form
                    // layout="vertical"
                    onFinish={onFinish}
                >
                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item
                                name="company"
                                label="Company"
                                rules={[{ required: true, message: 'Please select a company' }]}
                            >
                                <Select placeholder="Select Company">
                                    <Option value="SONU TEXTILES">SONU TEXTILES</Option>
                                    {/* Add more options as needed */}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                name="option"
                                label="Option"
                                rules={[{ required: true, message: 'Please select an option' }]}
                            >
                                <Select placeholder="Select Option">
                                    {/* Add options as needed */}
                                    <Option value="Option 1">Option 1</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                name="supplier"
                                label="Supplier"
                                rules={[{ required: true, message: 'Please select a supplier' }]}
                            >
                                <Select placeholder="Select Supplier">
                                    {/* Add options as needed */}
                                    <Option value="Customer 1">Customer 1</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                name="challanDate"
                                label="Challan Date"
                                rules={[{ required: true, message: 'Please select a date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                name="gstin1"
                                label="GSTIN"
                                rules={[{ required: true, message: 'Please enter GSTIN' }]}
                            >
                                <Input placeholder="24ABHPP6021C1Z4" />
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                name="company2"
                                label="Company"
                                rules={[{ required: true, message: 'Please select a company' }]}
                            >
                                <Select placeholder="Select Company">
                                    {/* Add options as needed */}
                                    <Option value="Company 1">Company 1</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                name="machine"
                                label="Machine"
                                rules={[{ required: true, message: 'Please select a machine' }]}
                            >
                                <Select placeholder="Select Machine">
                                    {/* Add options as needed */}
                                    <Option value="Machine 1">Machine 1</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                name="quality"
                                label="Quality"
                                rules={[{ required: true, message: 'Please select a quality' }]}
                            >
                                <Select placeholder="Select Quality">
                                    {/* Add options as needed */}
                                    <Option value="Quality 1">Quality 1</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                name="challanNo"
                                label="Challan No."
                                rules={[{ required: true, message: 'Please enter the challan number' }]}
                            >
                                <Input placeholder="3" />
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                name="gstin2"
                                label="GSTIN"
                                rules={[{ required: true, message: 'Please enter GSTIN' }]}
                            >
                                <Input placeholder="22AAAAA0000A1Z5" />
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                name="deliveryAddress"
                                label="Delivery Address"
                                rules={[{ required: true, message: 'Please enter the delivery address' }]}
                            >
                                <Input placeholder="Enter Delivery Address" />
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item
                                name="vehicle"
                                label="Vehicle"
                                rules={[{ required: true, message: 'Please enter the vehicle number' }]}
                            >
                                <Input placeholder="Vehicle no." />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>

            <Table
                components={components}
                rowClassName={() => 'editable-row'}
                bordered
                dataSource={data}
                columns={columns}
                pagination={false}
                scroll={{y:"280px"}}
            />

            <div className="flex items-center justify-between gap-2">
                <Space style={{ margin: "16px 0px" }} align='center' direction='horizontal'>
                    <Flex align="center" gap={10}>
                        <Typography.Text className="whitespace-nowrap">
                            Total Taka
                        </Typography.Text>
                        <Input/>
                    </Flex>
                    <Flex align="center" gap={10}>
                        <Typography.Text className="whitespace-nowrap">
                            Total Meter
                        </Typography.Text>
                        <Input/>
                    </Flex>
                    <Flex align="center" gap={10}>
                        <Typography.Text className="whitespace-nowrap">
                            Total Receive Meter
                        </Typography.Text>
                        <Input/>
                    </Flex> 

                </Space>
                <Space>

                    <Button type="primary">Submit</Button>
                    <Button type="primary" danger>Back</Button>
                </Space>
            </div>
        </div>
    );
};

export default AddReworkChallan;
