import React, { useState, useEffect, useContext } from "react";
import { Button, Input, Form, Row, Col, Modal, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import { CopyOutlined, CloseOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { createMultipleChallanYarnReceiveRequest } from "../../../../api/requests/purchase/yarnReceive";

const MultipleChallanCreateButton = ({ details }) => {
    const { companyId } = useContext(GlobalContext);
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [challanNumbers, setChallanNumbers] = useState([]);

    const [totalQuantity, setTotalQuantity] = useState(0);
    const [totalCartoon, setTotalCartoon] = useState(0);
    const [quantityRow, setTotalQuantityRow] = useState(1);
    const [cartoonRow, setCartoonRow] = useState(1);

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

    }, [])

    useEffect(() => {
        let temp = [];
        let temp_challan_no = `${details?.challan_no}`;
        temp.push(`${temp_challan_no}~0`);

        setValue(`challanNo0`, `${temp_challan_no}~0`);
        setValue(`quantity0`, details?.receive_quantity);
        setValue(`cartoon0`, details?.receive_cartoon_pallet)
        setTotalQuantity(details?.receive_quantity);
        setTotalCartoon(details?.receive_cartoon_pallet);
        setValue("temptotalQuantity", details?.receive_quantity);
        setValue("temptotalCartoon", details?.receive_cartoon_pallet);

        for (let i = 1; i < 6; i++) {
            temp.push(`${temp_challan_no}~${i}`);
            setValue(`challanNo${i}`, `${temp_challan_no}~${i}`);
        }
        setChallanNumbers([...temp]);

    }, [details, setValue]);

    const { mutateAsync: createYarnMultipleChallan } = useMutation({
        mutationFn: async (data) => {
            const res = await createMultipleChallanYarnReceiveRequest({
                id: details?.id,
                data,
                params: { company_id: companyId },
            });
            return res.data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries([
                "yarn-stock/yarn-receive-challan/list",
                { company_id: companyId },
            ]);
            const successMessage = res?.message;
            if (successMessage) {
                message.success(successMessage);
            }
            setIsModalOpen(false) ; 
        },
        onError: (error) => {
            mutationOnErrorHandler({ error, message });
        },
    });

    const HandleSubmit = async (values) => {
        let temp = [];
        challanNumbers.map((element, index) => {
            if (values[`quantity${index}`] != undefined) {
                temp.push({
                    "challan_no": element,
                    "receive_quantity": values[`quantity${index}`],
                    "receive_cartoon_pallet": values[`cartoon${index}`]
                })
            }
        });

        await createYarnMultipleChallan(temp);
    }
    return (
        <>
            <Button
                onClick={() => {
                    setIsModalOpen(true);
                }}
            >
                <CopyOutlined style={{color: "#228B22"}} />
            </Button>

            <Modal
                closeIcon={<CloseOutlined className="text-white" />}
                open={isModalOpen}
                title={
                    <Typography.Text className="text-xl font-medium text-white">
                        Multiple Receive Challan
                    </Typography.Text>
                }
                centered={true}
                classNames={{
                    header: "text-center",
                }}
                footer={null}
                width={"45%"}
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

                        <Col span={12}>
                            <Form.Item label="Total Quantity" name="temptotalQuantity" >
                                <Controller
                                    control={control}
                                    name={`temptotalQuantity`}
                                    disabled
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                        />
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Total Cartoon" name="temptotalCartoon">
                                <Controller
                                    control={control}
                                    name={`temptotalCartoon`}
                                    disabled
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                        />
                                    )}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24} style={{ marginTop: "-10px", borderTop: "1px solid #efefef" }}>
                        <Col span={8}>
                            <p><strong>Challan No</strong></p>
                        </Col>
                        <Col span={8}>
                            <p><strong>Quantity</strong></p>
                        </Col>
                        <Col span={8}>
                            <p><strong>Cartoon</strong></p>
                        </Col>
                    </Row>

                    {challanNumbers.map((challanNo, index) => (
                        <Row gutter={24} key={challanNo}>
                            <Col span={8}>
                                <Form.Item
                                    name={`challanNo${index}`}
                                    initialValue={challanNo}
                                >
                                    <Controller
                                        control={control}
                                        name={`challanNo${index}`}
                                        disabled
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    name={`quantity${index}`}
                                >
                                    <Controller
                                        control={control}
                                        name={`quantity${index}`}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="number"
                                                onChange={(e) => {
                                                    setValue(`quantity${index}`, e.target.value);
                                                    let temp = 0;
                                                    let totalRow = 0;
                                                    challanNumbers.map((element, count) => {
                                                        let value = getValues(`quantity${count}`);
                                                        if (value !== undefined && value !== "") {
                                                            temp = temp + parseInt(getValues(`quantity${count}`));
                                                            totalRow = totalRow + 1;
                                                        }
                                                    })
                                                    console.log("Total rows information ", totalRow);
                                                    setTotalQuantityRow(totalRow);
                                                    setTotalQuantity(temp);

                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name={`cartoon${index}`}
                                >
                                    <Controller
                                        control={control}
                                        name={`cartoon${index}`}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="number"
                                                onChange={(e) => {
                                                    setValue(`cartoon${index}`, e.target.value);
                                                    let temp = 0;
                                                    let totalRow = 0
                                                    challanNumbers.map((element, count) => {
                                                        let value = getValues(`cartoon${count}`);
                                                        if (value !== undefined && value !== "") {
                                                            temp = temp + parseInt(getValues(`cartoon${count}`));
                                                            totalRow = totalRow + 1;
                                                        }
                                                    })

                                                    console.log("Cartoon row", totalRow);
                                                    setTotalCartoon(temp);
                                                    setCartoonRow(totalRow);

                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    ))}

                    <Row gutter={24} style={{ marginTop: "-10px", borderTop: "1px solid #efefef" }}>
                        <Col span={8}>
                            <p><strong>Total</strong></p>
                        </Col>
                        <Col span={8}>
                            <p><strong>{totalQuantity}</strong></p>
                        </Col>
                        <Col span={8}>
                            <p><strong>{totalCartoon}</strong></p>
                        </Col>
                    </Row>

                    <Form.Item style={{ textAlign: "right", borderTop: "1px solid #efefef" }}>
                        {parseInt(details?.receive_quantity) === parseInt(totalQuantity) &&
                            parseInt(details?.receive_cartoon_pallet) === parseInt(totalCartoon) &&
                            quantityRow == cartoonRow && (

                                <Button type="primary" htmlType="submit" style={{ marginTop: 20 }}>Save</Button>
                            )}
                    </Form.Item>

                </Form>
            </Modal>

        </>
    )
}

export default MultipleChallanCreateButton; 