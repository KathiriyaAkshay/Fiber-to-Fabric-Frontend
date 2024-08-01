import React, { useState, useEffect, useContext } from "react";
import { Button, Input, Form, Row, Col, Modal, Typography, DatePicker, Flex, message } from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { UndoOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { CloseOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import moment from "moment";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup" ; 
import { useMutation } from "@tanstack/react-query";
import { mutationOnErrorHandler } from "../../../../utils/mutationUtils";
import { createYarnReturnRequest } from "../../../../api/requests/purchase/yarnReceive";

const yarnReturnResolverSchema = yupResolver(
    yup.object().shape({
        return_quantity: yup.string().required("Required return quantity"), 
        return_cartoon: yup.string().required("Required return cartoon"), 
        createdAt: yup.string().required("Required return date")
    })
);

const YarnReturnModel = ({ details }) => {

    const { companyId } = useContext(GlobalContext);
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false) ; 

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
        resolver: yarnReturnResolverSchema,
        defaultValues: {
        },
    });

    useEffect(() => {
        setValue("challan_date", moment(details?.challan_date).format("YYYY-MM-DD")); 
        setValue("challan_no", details?.challan_no); 
        setValue("yarn_company", details?.yarn_stock_company?.yarn_company_name) ; 
        setValue("yarn_dennier", `${details?.yarn_stock_company?.yarn_denier} (${details?.yarn_stock_company?.yarn_Sub_type} ${details?.yarn_stock_company?.luster_type}  ${details?.yarn_stock_company?.yarn_color})`); 
        setValue("total_quantity", details?.receive_quantity) ; 
        setValue("total_cartoon", details?.receive_cartoon_pallet) ; 
    }, [details, setValue]) ; 

    const {total_quantity, return_quantity} = watch() ; 

    useEffect(() => {
        if (total_quantity < return_quantity){
            message.error("Return quantity should be less than total quantity") ;
        }
    }, [total_quantity, return_quantity])

    
    function disabledFutureDate(current) {
        // Disable dates after today
        return current && current > moment().endOf("day");
    }

    const { mutateAsync: createReturnYarn, isPending } = useMutation({
        mutationFn: async (data) => {
            setLoading(true) ; 
            const res = await createYarnReturnRequest({
                data,
                params: {
                company_id: companyId,
                },
            });
            return res.data;
        },
        mutationKey: ["yarn-receive", "return", "create"],
        onSuccess: (res) => {
            setIsModalOpen(false) ;
            setLoading(false) ; 
            queryClient.invalidateQueries([
                "yarn-stock/yarn-receive-challan/list",
                { company_id: companyId },
            ]);
            const successMessage = res?.message;
                if (successMessage) {
                    message.success(successMessage);
            }
        },
        onError: (error) => {
            setLoading(false) ; 
            mutationOnErrorHandler({ error, message });
        },
      });

    const HandleSubmit = async (data) => {
        let requestPayload = {
            "yarn_challan_id": details?.id, 
            "return_quantity": data?.return_quantity,
            "return_cartoon": data?.return_cartoon,
            "createdAt": data?.createdAt
        };
        await createReturnYarn(requestPayload) ;  
        
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
                                required
                                name="return_quantity" 
                                validateStatus={errors.return_quantity ? "error" : ""}
                                help={errors.return_quantity && errors.return_quantity.message}
                                >
                                <Controller
                                    control={control}
                                    name={`return_quantity`}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                        />
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Return Cartoon"
                                required
                                name="return_cartoon" 
                                validateStatus={errors.return_cartoon ? "error" : ""}
                                help={errors.return_cartoon && errors.return_cartoon.message}
                                >
                                <Controller
                                    control={control}
                                    name={`return_cartoon`}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                        />
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item 
                                label="Return Date" 
                                name="createdAt"
                                validateStatus={errors.createdAt ? "error" : ""}
                                help={errors.createdAt && errors.createdAt.message}
                            >
                                <Controller
                                    control={control}
                                    name={`createdAt`}
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

                    <Flex gap={10} justify="flex-end">
                        {total_quantity >= return_quantity && (
                            <Button type="primary" htmlType="submit" loading = {loading} >
                                Create
                            </Button>
                        )}
                    </Flex>
                </Form>
            </Modal>
        </>
    )
}

export default YarnReturnModel;     