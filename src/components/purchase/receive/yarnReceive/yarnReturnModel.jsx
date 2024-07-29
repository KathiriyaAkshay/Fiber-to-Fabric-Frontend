import React, { useState, useEffect, useContext } from "react";
import { Button, Input, Form, Row, Col, Modal, Typography, DatePicker } from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { UndoOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { CloseOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import moment from "moment";

const YarnReturnModel = ({ details }) => {
    console.log("Details information ======================");
    console.log(details);

    const { companyId } = useContext(GlobalContext);
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        getValues,
        setError,
        clearErrors,
        watch,
    } = useForm({
        defaultValues: {
        },
    });

    useEffect(() => {
        setValue("challan_date", moment(details?.challan_date).format("YYYY-MM-DD")); 
        setValue("challan_no", details?.challan_no); 
        setValue("yarn_company", details?.yarn_stock_company?.yarn_company_name) ; 
        setValue("yarn_dennier", `${details?.yarn_stock_company?.yarn_denier} (${details?.yarn_stock_company?.yarn_Sub_type} ${details?.yarn_stock_company?.luster_type}  ${details?.yarn_stock_company?.yarn_color})`)
    }, [details, setValue])

    const HandleSubmit = async () => {

    }

    function disabledFutureDate(current) {
        // Disable dates after today
        return current && current > moment().endOf("day");
    }

    return (
        <>
            <Button onClick={() => { setIsModalOpen(true) }}>
                <UndoOutlined />
            </Button>

            <Modal
                closeIcon={<CloseOutlined className="text-white" />}
                open={isModalOpen}
                title={
                    <Typography.Text className="text-xl font-medium text-white">
                        Yarn Return
                    </Typography.Text>
                }
                // centered={true}
                classNames={{
                    header: "text-center",
                }}
                footer={null}
                width={"60%"}
                onCancel={() => { setIsModalOpen(false) }}
                styles={{
                    content: {
                        padding: 0,
                    },
                    header: {
                        padding: "16px",
                        margin: 0,
                    },
                    body: {
                        padding: "10px 16px",
                    }
                }}
            >
                <Form layout="vertical" style={{ margin: "0" }} onFinish={handleSubmit(HandleSubmit)}>
                    <Row gutter={24}>
                        <Col span={6}>
                            <Form.Item label="Challan Date"
                                name="challan_date" >
                                <Controller
                                    control={control}
                                    name={`challan_date`}
                                    render={({ field }) => (
                                        <Input
                                            readOnly
                                            {...field}
                                        />
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Challan No"
                                name="challan_no" >
                                <Controller
                                    control={control}
                                    name={`challan_no`}
                                    render={({ field }) => (
                                        <Input
                                            readOnly
                                            {...field}
                                        />
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Yarn Company"
                                name="yarn_company" >
                                <Controller
                                    control={control}
                                    name={`yarn_company`}
                                    render={({ field }) => (
                                        <Input
                                            readOnly
                                            {...field}
                                        />
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Yarn Dennier"
                                name="yarn_dennier" >
                                <Controller
                                    control={control}
                                    name={`yarn_dennier`}
                                    render={({ field }) => (
                                        <Input
                                            readOnly
                                            {...field}
                                        />
                                    )}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={6}>
                            <Form.Item label="Supplier Name"
                                name="supplier_name" >
                                <Controller
                                    control={control}
                                    name={`supplier_name`}
                                    render={({ field }) => (
                                        <Input
                                            readOnly
                                            {...field}
                                        />
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Supplier Company"
                                name="supplier_company" >
                                <Controller
                                    control={control}
                                    name={`supplier_company`}
                                    render={({ field }) => (
                                        <Input
                                            readOnly
                                            {...field}
                                        />
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Total Quantity"
                                name="total_quantity" >
                                <Controller
                                    control={control}
                                    name={`total_quantity`}
                                    render={({ field }) => (
                                        <Input
                                            readOnly
                                            {...field}
                                        />
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Total Cartoon"
                                name="total_cartoon" >
                                <Controller
                                    control={control}
                                    name={`total_cartoon`}
                                    render={({ field }) => (
                                        <Input
                                            readOnly
                                            {...field}
                                        />
                                    )}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={6}>
                            <Form.Item label="Return Quantity"
                                name="return_quantity" >
                                <Controller
                                    control={control}
                                    name={`return_quantity`}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                        />
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Return Cartoon"
                                name="return_cartoon" >
                                <Controller
                                    control={control}
                                    name={`return_cartoon`}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                        />
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Return Date" name="return_date">
                                <Controller
                                    control={control}
                                    name={`return_date`}
                                    render={({ field }) => (
                                        <DatePicker
                                            format="YYYY-MM-DD"
                                            {...field}
                                            disabledDate={disabledFutureDate}
                                        />
                                    )}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    )
}

export default YarnReturnModel;     