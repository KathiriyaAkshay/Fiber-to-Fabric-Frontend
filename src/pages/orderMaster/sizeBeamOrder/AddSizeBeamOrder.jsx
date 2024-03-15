import { ArrowLeftOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DevTool } from "@hookform/devtools";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getYSCDropdownList } from "../../../api/requests/reports/yarnStockReport";
import { createSizeBeamOrderRequest } from "../../../api/requests/orderMaster";
import { getDropdownSupplierListRequest } from "../../../api/requests/users";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import dayjs from "dayjs";
import SizeBeamOrderDetail from "../../../components/orderMaster/sizeBeamOrder/SizeBeamOrderDetail";
import { initialOrderDetail } from "../../../constants/orderMaster";

const addSizeBeamOrderSchema = yup.object().shape({
  order_date: yup.string().required("Please select order date"),
  machine_type: yup.string().required("Please select machine type"),
  supplier_name: yup.string().required("Please select supplier"),
  supplier_id: yup.string().required("Please select supplier company"),
  yarn_company_name: yup.string().required("Please select yarn stock company"),
  yarn_stock_company_id: yup
    .string()
    .required("Please select yarn stock company ID"),
  purchased_to_company_id: yup
    .string()
    .required("Please select purchased to company ID"),
  rate_per_kg: yup.string().required("Please enter rate per kg"),
  credit_day: yup.string().required("Please enter credit day"),
  order_details: yup.array().of(
    yup.object().shape({
      ends_or_tars: yup.string().required("Please enter ends or tars"),
      tpm: yup.string().required("Please enter TPM"),
      grade: yup.string().required("Please enter grade"),
      meters: yup.string().required("Please enter meters"),
      pano: yup.string().required("Please enter pano"),
      remark: yup.string().required("Please enter remark"),
    })
  ),
});

function AddSizeBeamOrder() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [denierOptions, setDenierOptions] = useState([]);
  const [supplierCompanyOptions, setSupplierCompanyOptions] = useState([]);

  function goBack() {
    navigate(-1);
  }

  const { companyId, isLoadingCompanyList, companyListRes } =
    useContext(GlobalContext);

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

  const { mutateAsync: createSizeBeamOrder } = useMutation({
    mutationFn: async (data) => {
      const res = await createSizeBeamOrderRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["order-master", "yarn-order", "create"],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "order-master",
        "yarn-order",
        "list",
        { company_id: companyId },
      ]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      if (typeof errorMessage === "object") {
        const err = errorMessage?.details?.[0]?.message;
        message.error(err);
      }
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  async function onSubmit(data) {
    // delete fields that are not allowed in API
    delete data?.yarn_company_name;
    await createSizeBeamOrder(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(addSizeBeamOrderSchema),
    defaultValues: {
      order_date: dayjs(),
      machine_type: "Looms",
      order_details: [initialOrderDetail],
    },
  });

  function goToAddYarnStockCompany() {
    navigate("/yarn-stock-company/company-list/add");
  }

  function goToAddSupplier() {
    navigate("/user-master/my-supplier/add");
  }

  const { yarn_company_name, supplier_name } = watch();

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
          }) => {
            return {
              label: `${yarn_denier}D/${filament}F (${luster_type} - ${yarn_color})`,
              value: yarn_company_id,
            };
          }
        );
        if (options?.length) {
          setDenierOptions(options);
        }
      }
    });
  }, [yarn_company_name, yscdListRes?.yarnCompanyList]);

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
  }, [dropdownSupplierListRes, supplier_name]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Create Order to Send Beam Pipe</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={8}>
            <Form.Item
              label="Date"
              name="order_date"
              validateStatus={errors.order_date ? "error" : ""}
              help={errors.order_date && errors.order_date.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="order_date"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    style={{
                      width: "100%",
                    }}
                    format="DD/MM/YYYY"
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Machine Type"
              name="machine_type"
              validateStatus={errors.machine_type ? "error" : ""}
              help={errors.machine_type && errors.machine_type.message}
              wrapperCol={{ sm: 24 }}
              style={{
                marginBottom: "8px",
              }}
            >
              <Controller
                control={control}
                name="machine_type"
                render={({ field }) => (
                  <Select
                    {...field}
                    options={[
                      {
                        label: "Looms",
                        value: "Looms",
                      },
                    ]}
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

          <Col span={8} className="flex items-end gap-2">
            <Form.Item
              label="Supplier"
              name="supplier_name"
              validateStatus={errors.supplier_name ? "error" : ""}
              help={errors.supplier_name && errors.supplier_name.message}
              wrapperCol={{ sm: 24 }}
              className="flex-grow"
            >
              <Controller
                control={control}
                name="supplier_name"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select supplier"
                    loading={isLoadingDropdownSupplierList}
                    options={dropdownSupplierListRes?.map((supervisor) => ({
                      label: supervisor?.supplier_name,
                      value: supervisor?.supplier_name,
                    }))}
                  />
                )}
              />
            </Form.Item>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={goToAddSupplier}
              className="flex-none mb-6"
              type="primary"
            />
          </Col>

          <Col span={8}>
            <Form.Item
              label="Supplier Company"
              name="supplier_id"
              validateStatus={errors.supplier_id ? "error" : ""}
              help={errors.supplier_id && errors.supplier_id.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="supplier_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select supplier Company"
                    loading={isLoadingDropdownSupplierList}
                    options={supplierCompanyOptions}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8} className="flex items-end gap-2">
            <Form.Item
              label="Yarn Stock Company Name"
              name="yarn_company_name"
              validateStatus={errors.yarn_company_name ? "error" : ""}
              help={
                errors.yarn_company_name && errors.yarn_company_name.message
              }
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
                        };
                      }
                    )}
                  />
                )}
              />
            </Form.Item>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={goToAddYarnStockCompany}
              className="flex-none mb-6"
              type="primary"
            />
          </Col>

          <Col span={8}>
            <Form.Item
              label="Denier"
              name="yarn_stock_company_id"
              validateStatus={errors.yarn_stock_company_id ? "error" : ""}
              help={
                errors.yarn_stock_company_id &&
                errors.yarn_stock_company_id.message
              }
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="yarn_stock_company_id"
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
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Purchased to Company"
              name="purchased_to_company_id"
              validateStatus={errors.purchased_to_company_id ? "error" : ""}
              help={
                errors.purchased_to_company_id &&
                errors.purchased_to_company_id.message
              }
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="purchased_to_company_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Company"
                    loading={isLoadingCompanyList}
                    options={companyListRes?.rows?.map(
                      ({ company_name = "", id = "" }) => ({
                        label: company_name,
                        value: id,
                      })
                    )}
                    style={{
                      width: "100%",
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Rate Per KGS (Rs)"
              name="rate_per_kg"
              validateStatus={errors.rate_per_kg ? "error" : ""}
              help={errors.rate_per_kg && errors.rate_per_kg.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="rate_per_kg"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="5.5"
                    type="number"
                    min={0}
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Credit Days"
              name="credit_day"
              validateStatus={errors.credit_day ? "error" : ""}
              help={errors.credit_day && errors.credit_day.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="credit_day"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="30"
                    type="number"
                    min={0}
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <SizeBeamOrderDetail control={control} errors={errors} />

        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Flex>
      </Form>

      <DevTool control={control} />
    </div>
  );
}

export default AddSizeBeamOrder;
