import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Col, Form, Row, DatePicker, Input, Select, Flex, message } from "antd";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { createSaleYarnChallanRequest } from "../../../../api/requests/sale/challan/challan";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { createSaleJobWorkChallanRequest } from "../../../../api/requests/sale/challan/challan";

const jobWorkChallanResolver = yupResolver(
    yup.object().shape({
        yarn_company_name: yup
            .string()
            .required("Please select yarn stock company"),
        yarn_company_id: yup.string().required("Please select denier"),
        supplier_name: yup.string().required("Please, Select Party"),
        supplier_id: yup.string().required("Please, Select Party Company"),
        challan_no: yup.string().required("Please, enter challan number"),
        vehicle_id: yup.string().required("Please, select vehicle user"),
        quantity: yup.string().required("Please, enter quantity"),
        kg: yup.string().required("Please, enter kg value"), 
        current_stock: yup.string(), 
        hsn_no: yup.string().required("Please enter hsn code"), 
        notes:  yup.string().required("Please enter notes for this challan")
    })
);

function AddJobWorkSaleChallan(){
    const navigation = useNavigate();
    const queryClient = useQueryClient();
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm({
        resolver: jobWorkChallanResolver,
        defaultValues: {
            cartoon: 0, 
            current_stock: 0, 
            remaining_stock: 0,
            order_date: dayjs(),
        },
    });
    const { companyId, companyListRes } = useContext(GlobalContext);

    const [denierOptions, setDenierOptions] = useState([]);
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

    const { yarn_company_name, supplier_name} = watch();

    useEffect(() => {
        // set options for denier selection on yarn stock company select
        yscdListRes?.yarnCompanyList?.forEach((ysc) => {
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
    }, [yarn_company_name, yscdListRes?.yarnCompanyList]);

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
    }, [dropdownSupplierListRes, supplier_name]);

    const { mutateAsync: createJobWorkChallan } = useMutation({
        mutationFn: async (data) => {
          const res = await createSaleJobWorkChallanRequest({
            data,
            params: { company_id: companyId },
          });
          return res.data;
        },
        mutationKey: ["yarn-stock", "yarn-report", "create"],
        onSuccess: (res) => {
          queryClient.invalidateQueries(["reports", "list", companyId]);
          const successMessage = res?.message;
          if (successMessage) {
            message.success(successMessage);
          }
          navigation(-1);
        },
        onError: (error) => {
          const errorMessage = error?.response?.data?.message || error.message;
          message.error(errorMessage);
        },
      });


    async function onSubmit(data) {
        delete data?.remaining_stock ; 
        delete data?.supplier_name ;
        delete data?.order_date ; 
        delete data?.yarn_company_name ; 
        delete data?.order_type ; 
        delete data?.cartoon ; 
        delete data?.current_stock; 
        
        console.log(data);

        await createJobWorkChallan(data) ; 
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
                <h3 className="m-0 text-primary">Create Job Work Sale</h3>
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
                                            console.log(option);
                                            setValue("yarn_company_id", value)
                                            setValue("current_stock", option?.current_stock)
                                        }}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            label="HSN code"
                            name="hsn_no"
                            validateStatus={errors.hsn_no ? "error" : ""}
                            help={errors.hsn_no && errors.hsn_no.message}
                            wrapperCol={{ sm: 24 }}
                            required={true}
                        >
                            <Controller
                                control={control}
                                placeholder = "Enter HSN code"
                                name="hsn_no"
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
                            label="Quantity"
                            name="quantity"
                            validateStatus={errors.quantity ? "error" : ""}
                            help={errors.quantity && errors.quantity.message}
                            wrapperCol={{ sm: 24 }}
                            required={true}
                        >
                            <Controller
                                control={control}
                                name="quantity"
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
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            label="Notes"
                            name="notes"
                            validateStatus={errors.notes ? "error" : ""}
                            help={errors.notes && errors.notes.message}
                            wrapperCol={{ sm: 24 }}
                            required={true}
                        >
                            <Controller
                                control={control}
                                name="notes"
                                // disabled
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
                    <Button type="primary" htmlType="submit">
                        Create
                    </Button>
                </Flex>
            </Form>
        </div>
    )
}

export default AddJobWorkSaleChallan ; 