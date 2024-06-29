import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Col, Form, Row, DatePicker, Input, Select, Flex, message } from "antd";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import dayjs from "dayjs";
import moment from "moment";
import { useContext } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useQuery } from "@tanstack/react-query";
import { getYSCDropdownList } from "../../../../api/requests/reports/yarnStockReport";
import { getVehicleUserListRequest, getDropdownSupplierListRequest } from "../../../../api/requests/users";
import { createSaleYarnChallanRequest, updateYarnSalerChallanRequest } from "../../../../api/requests/sale/challan/challan";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { getYarnSaleChallanByIdRequest } from "../../../../api/requests/sale/challan/challan";

const yarnSaleChallanResolver = yupResolver(
    yup.object().shape({
        cartoon: yup.string().required("Please, enter cartoon"),
        kg: yup.string().required("Please, enter kg value"),
    })
);

function UpdateYarnSaleChallan() {
    const navigation = useNavigate();
    const queryClient = useQueryClient();
    const [currentStockInfo, setCurrentStockInfo] = useState(0);
    const [createOption, setCreateOption] = useState(true);
    const { id } = useParams();
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm({
        resolver: yarnSaleChallanResolver,
        defaultValues: {
            cartoon: 0,
            current_stock: 0,
            remaining_stock: 0,
            order_date: dayjs(),
        },
    });
    const { companyId, companyListRes } = useContext(GlobalContext);

    const [denierOptions, setDenierOptions] = useState([]);
    const [pendingKG, setPendingKG] = useState(0) ; 
    const [supplierCompanyOptions, setSupplierCompanyOptions] = useState([]);
    const { data: vehicleListRes, isLoading: isLoadingVehicleList } = useQuery({
        queryKey: [
            "vehicle",
            "list",
            { company_id: companyId, page: 0, pageSize: 99999 },
        ],
        queryFn: async () => {
            const res = await getVehicleUserListRequest({
                params: { company_id: companyId, page: 0, pageSize: 99999 },
            });
            return res.data?.data;
        },
        enabled: Boolean(companyId),
    });

    const { data: yscdListRes, isLoading: isLoadingYSCDList } = useQuery({
        queryKey: ["dropdown", "yarn_company", "list", { company_id: companyId }],
        queryFn: async () => {
            const res = await getYSCDropdownList({
                params: { company_id: companyId },
            });
            return res.data?.data;
        },
        enabled: Boolean(companyId),
    });

    const { data: yarnSaleChallanDetails } = useQuery({
        queryFn: async () => {
            const res = await getYarnSaleChallanByIdRequest({
                id,
                params: { company_id: companyId },
            });
            return res.data?.data;
        },
        enabled: Boolean(companyId),
    });

    const { yarn_company_name, supplier_name, current_stock, cartoon } = watch();

    useEffect(() => {
        let temp_remain_stock = current_stock - cartoon;
        setValue("remaining_stock", temp_remain_stock);
    }, [cartoon, current_stock, setValue]);

    useEffect(() => {
        yarnSaleChallanDetails && yscdListRes?.yarnCompanyList?.forEach((ysc) => {
            const { yarn_company_name: name = "", yarn_details = [] } = ysc;
            if (name === yarn_company_name) {
                const options = yarn_details?.map(
                    ({
                        yarn_company_id = 0,
                        filament = 0,
                        yarn_denier = 0,
                        luster_type = "",
                        yarn_color = "",
                        current_stock = 0
                    }) => {

                        if (yarnSaleChallanDetails?.yarn_stock_company?.id == yarn_company_id) {
                            
                            // ==== Set Stock information ==== // 

                            let temp_current_stock = current_stock + yarnSaleChallanDetails?.kg ; 
                            setValue("current_stock", temp_current_stock)
                            setCurrentStockInfo(temp_current_stock) ; 
                            
                            let remain_stock = Number(temp_current_stock) - Number(yarnSaleChallanDetails?.kg) ; 
                            setValue("pending_kg", remain_stock) ; 
                            setPendingKG(remain_stock) ; 

                        }
                        return {
                            label: `${yarn_denier}D/${filament}F (${luster_type} - ${yarn_color})`,
                            value: yarn_company_id,
                            current_stock: current_stock
                        };
                    }
                );
                if (options?.length) {
                    setDenierOptions(options);
                }
            }
        });
    }, [yarn_company_name, yscdListRes?.yarnCompanyList, yarnSaleChallanDetails]);

    const {
        data: dropdownSupplierListRes,
        isLoading: isLoadingDropdownSupplierList,
    } = useQuery({
        queryKey: ["dropdown/supplier/list", { company_id: companyId }],
        queryFn: async () => {
            const res = await getDropdownSupplierListRequest({
                params: { company_id: companyId },
            });
            return res.data?.data?.supplierList;
        },
        enabled: Boolean(companyId),
    });

    useEffect(() => {
        // set options for supplier company selection on supplier name select
        dropdownSupplierListRes?.forEach((spl) => {
            const { supplier_name: name = "", supplier_company = [] } = spl;
            if (name === supplier_name) {
                const options = supplier_company?.map(
                    ({ supplier_id = 0, supplier_company = "" }) => {
                        return {
                            label: supplier_company,
                            value: supplier_id,
                        };
                    }
                );
                if (options?.length) {
                    setSupplierCompanyOptions(options);
                }
            }
        });
    }, [dropdownSupplierListRes, supplier_name, yarnSaleChallanDetails]);

    const { mutateAsync: updateYarnSaleChallan } = useMutation({
        mutationFn: async (data) => {
            const res = await updateYarnSalerChallanRequest({
                id,
                data,
                params: { company_id: companyId },
            });
            return res.data;
        },
        onSuccess: (res) => {
            message.success("Update yarn sale challan successfully")
            navigation(-1);
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.message || error.message;
            message.error(errorMessage);
        },
    });

    useEffect(() => {
        if (yarnSaleChallanDetails) {
            reset({
                order_date: dayjs(yarnSaleChallanDetails?.createdAt),
                supplier_name: yarnSaleChallanDetails?.supplier?.supplier_name,
                supplier_id: yarnSaleChallanDetails?.supplier?.user_id,
                challan_no: yarnSaleChallanDetails?.challan_no,
                vehicle_id: yarnSaleChallanDetails?.vehicle?.id,
                yarn_company_name: yarnSaleChallanDetails?.yarn_stock_company?.yarn_company_name,
                yarn_company_id: yarnSaleChallanDetails?.yarn_stock_company?.id,
                cartoon: yarnSaleChallanDetails?.cartoon,
                kg: yarnSaleChallanDetails?.kg,
                // pending_kg: yarnSaleChallanDetails?.pending_kg
            })
            
        }
    }, [yarnSaleChallanDetails, reset])


    async function onSubmit(data) {
        delete data?.remaining_stock;
        delete data?.supplier_name;
        delete data?.order_date;
        delete data?.yarn_company_name;
        delete data?.order_type;
        delete data?.yarn_company_id;
        delete data?.supplier_id;
        delete data?.vehicle_id;
        delete data?.current_stock;
        delete data?.challan_no;
        data["pending_kg"] = pendingKG ; 

        await updateYarnSaleChallan(data);
    };

    const disabledDate = (current) => {
        return current && current > moment().endOf('day');
    };

    return (
        <div className="flex flex-col p-4">
            <div className="flex items-center gap-5">
                <Button onClick={() => { navigation(-1) }}>
                    <ArrowLeftOutlined />
                </Button>
                <h3 className="m-0 text-primary">Update Yarn Sale</h3>
            </div>

            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                <Row
                    gutter={10}
                    style={{
                        padding: "12px"
                    }}
                >
                    <Col span={6}>
                        <Form.Item
                            label="Order Date"
                            name="order_date"
                            validateStatus={errors.order_date ? "error" : ""}
                            help={errors.order_date && errors.order_date.message}
                            wrapperCol={{ sm: 24 }}
                            required={true}
                        >
                            <Controller
                                control={control}
                                name="order_date"
                                disabled
                                render={({ field }) => (
                                    <DatePicker
                                        {...field}
                                        disabledDate={disabledDate}
                                        style={{
                                            width: "100%",
                                        }}
                                        format="DD/MM/YYYY"
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6} className="flex items-end gap-2">
                        <Form.Item
                            label="Party"
                            name="supplier_name"
                            validateStatus={errors.supplier_name ? "error" : ""}
                            help={errors.supplier_name && errors.supplier_name.message}
                            required={true}
                            wrapperCol={{ sm: 24 }}
                            className="flex-grow"
                        >
                            <Controller
                                control={control}
                                name="supplier_name"
                                disabled
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        placeholder="Select Party"
                                        loading={isLoadingDropdownSupplierList}
                                        options={dropdownSupplierListRes?.map((supervisor) => ({
                                            label: supervisor?.supplier_name,
                                            value: supervisor?.supplier_name,
                                        }))}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            label="Party Company"
                            name="supplier_id"
                            validateStatus={errors.supplier_id ? "error" : ""}
                            help={errors.supplier_id && errors.supplier_id.message}
                            required={true}
                            wrapperCol={{ sm: 24 }}
                        >
                            <Controller
                                control={control}
                                name="supplier_id"
                                disabled
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        placeholder="Select party Company"
                                        loading={isLoadingDropdownSupplierList}
                                        options={supplierCompanyOptions}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    {/* <Col span={6}>
                        <Form.Item
                            label="Company name"
                            name="company_name"
                            validateStatus={errors.company_name ? "error" : ""}
                            help={errors.company_name && errors.company_name.message}
                            wrapperCol={{ sm: 24 }}
                            required={true}
                        >
                            <Controller
                                control={control}
                                name="company_name"
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        placeholder="Select Company name"
                                        options={companyListRes?.rows?.map(
                                            ({ company_name = "", id = "" }) => ({
                                                label: company_name,
                                                value: id,
                                            })
                                        )}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col> */}

                    <Col span={6}>
                        <Form.Item
                            label="Challan No"
                            name="challan_no"
                            validateStatus={errors.challan_no ? "error" : ""}
                            help={errors.challan_no && errors.challan_no.message}
                            wrapperCol={{ sm: 24 }}
                            required={true}
                        >
                            <Controller
                                disabled
                                control={control}
                                name="challan_no"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            label="Vehicle No"
                            name="vehicle_id"
                            validateStatus={errors.vehicle_id ? "error" : ""}
                            help={errors.vehicle_id && errors.vehicle_id.message}
                            wrapperCol={{ sm: 24 }}
                            required={true}
                        >
                            <Controller
                                control={control}
                                name="vehicle_id"
                                disabled
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        loading={isLoadingVehicleList}
                                        placeholder="Select Vehicle"
                                        options={vehicleListRes?.vehicleList?.rows?.map(
                                            (vehicle) => ({
                                                label:
                                                    vehicle.first_name +
                                                    " " +
                                                    vehicle.last_name +
                                                    " " +
                                                    `| ( ${vehicle?.username})`,
                                                value: vehicle.id,
                                            })
                                        )}
                                        style={{
                                            textTransform: "capitalize",
                                        }}
                                        dropdownStyle={{
                                            textTransform: "capitalize",
                                        }}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            label="Yarn Company"
                            name="yarn_company_name"
                            validateStatus={errors.yarn_company_name ? "error" : ""}
                            help={
                                errors.yarn_company_name && errors.yarn_company_name.message
                            }
                            required={true}
                            wrapperCol={{ sm: 24 }}
                            className="flex-grow"
                        >
                            <Controller
                                control={control}
                                name="yarn_company_name"
                                disabled
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        placeholder="Select Yarn Stock Company"
                                        loading={isLoadingYSCDList}
                                        options={yscdListRes?.yarnCompanyList?.map(
                                            ({ yarn_company_name = "" }) => {
                                                return {
                                                    label: yarn_company_name,
                                                    value: yarn_company_name,
                                                    // current_stock: 
                                                };
                                            }
                                        )}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            label="Denier"
                            name="yarn_company_id"
                            validateStatus={errors.yarn_company_id ? "error" : ""}
                            help={
                                errors.yarn_company_id &&
                                errors.yarn_company_id.message
                            }
                            required={true}
                            wrapperCol={{ sm: 24 }}
                        >
                            <Controller
                                control={control}
                                name="yarn_company_id"
                                disabled
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        placeholder="Select denier"
                                        allowClear
                                        loading={isLoadingYSCDList}
                                        options={denierOptions}
                                        style={{
                                            textTransform: "capitalize",
                                        }}
                                        dropdownStyle={{
                                            textTransform: "capitalize",
                                        }}
                                        onChange={(value, option) => {
                                            setValue("yarn_company_id", value)
                                            setValue("current_stock", option?.current_stock)
                                            setCurrentStockInfo(option?.current_stock) ; 
                                        }}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            label="Current Stock"
                            name="current_stock"
                            validateStatus={errors.current_stock ? "error" : ""}
                            help={errors.current_stock && errors.current_stock.message}
                            wrapperCol={{ sm: 24 }}
                            required={true}
                        >
                            <Controller
                                control={control}
                                disabled
                                name="current_stock"
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
                            label="Cartoon"
                            name="cartoon"
                            validateStatus={errors.cartoon ? "error" : ""}
                            help={errors.cartoon && errors.cartoon.message}
                            wrapperCol={{ sm: 24 }}
                            required={true}
                        >
                            <Controller
                                control={control}
                                name="cartoon"
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
                            label="KG"
                            name="kg"
                            validateStatus={errors.kg ? "error" : ""}
                            help={errors.kg && errors.kg.message}
                            wrapperCol={{ sm: 24 }}
                            required={true}
                        >
                            <Controller
                                control={control}
                                name="kg"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="number"
                                        onChange={(e) => {
                                            setValue("kg", e.target.value);

                                            let current_cartoon = Number(e.target.value);
                                            let remaining_stock = Number(currentStockInfo) - current_cartoon;
                                            if (remaining_stock < 0) {
                                                setValue("pending_kg", 0);
                                                setPendingKG(0) ; 
                                                setCreateOption(false);
                                            } else {
                                                setCreateOption(true);
                                                setValue("pending_kg", remaining_stock);
                                                setPendingKG(remaining_stock) ; 
                                            }
                                        }}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            label="Remaining stock"
                            name="pending_kg"
                            validateStatus={errors.pending_kg ? "error" : ""}
                            help={errors.pending_kg && errors.pending_kg.message}
                            wrapperCol={{ sm: 24 }}
                            required={true}
                        >
                            <Controller
                                control={control}
                                name="pending_kg"
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

                <Flex gap={10} justify="flex-end">
                    <Button htmlType="button" onClick={() => reset()}>
                        Reset
                    </Button>
                    {createOption && (
                        <Button type="primary" htmlType="submit">
                            Update
                        </Button>
                    )}
                </Flex>
            </Form>
        </div>
    )
}

export default UpdateYarnSaleChallan; 