import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Typography,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { getInHouseQualityListRequest } from "../../../api/requests/qualityMaster";
import { getDropdownSupplierListRequest } from "../../../api/requests/users";
// import { useCurrentUser } from "../../../../api/hooks/auth";
import { getMyOrderListRequest } from "../../../api/requests/orderMaster";
import { addJobTakaRequest } from "../../../api/requests/job/jobTaka";
import dayjs from "dayjs";
import FieldTable from "../../../components/fieldTable";

const addJobTakaSchemaResolver = yupResolver(
  yup.object().shape({
    delivery_address: yup.string().required("Please enter delivery address."),
    gst_state: yup.string().required("Please enter GST State."),
    gst_in_1: yup.string().required("Please enter GST In."),
    gst_in_2: yup.string().required("Please enter GST In."),
    challan_no: yup.string().required("Please enter challan no."),
    gray_order_id: yup.string().required("Please select order."),
    supplier_id: yup.string().required("Please select supplier."),
    broker_id: yup.string().required("Please select broker."),
    quality_id: yup.string().required("Please select quality."),
    total_meter: yup.string().required("Please enter total meter."),
    total_weight: yup.string().required("Please enter total weight."),
    total_taka: yup.string().required("Please enter total taka."),
  })
);

const AddJobTaka = () => {
  const queryClient = useQueryClient();
  // const [fieldArray, setFieldArray] = useState([0]);

  const [activeField, setActiveField] = useState(1);
  console.log({ activeField });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pendingMeter, setPendingMeter] = useState("");
  const [pendingTaka, setPendingTaka] = useState("");

  const navigate = useNavigate();
  //   const { data: user } = useCurrentUser();
  const { companyId, companyListRes } = useContext(GlobalContext);
  function goBack() {
    navigate(-1);
  }

  const { mutateAsync: AddJobTaka, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await addJobTakaRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["job", "taka", "add"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["jobTaka", "list", companyId]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  async function onSubmit(data) {
    console.log({ data });
    const jobChallanDetailArr = Array.from(
      { length: activeField },
      (_, i) => i + 1
    );

    const newData = {
      delivery_address: data.delivery_address,
      gst_state: data.gst_state,
      gst_in: data.gst_in_2,
      challan_no: data.challan_no,
      gray_order_id: +data.gray_order_id,
      supplier_id: +data.supplier_id,
      broker_id: +data.broker_id,
      quality_id: +data.quality_id,
      total_meter: +data.total_meter,
      total_weight: +data.total_weight,
      pending_meter: +pendingMeter,
      pending_weight: 0,
      pending_taka: +pendingTaka,
      total_taka: +data.total_taka,
      is_grey: true,
      job_challan_detail: jobChallanDetailArr.map((field) => {
        return {
          taka_no: parseInt(data[`taka_no_${field}`]),
          meter: parseInt(data[`meter_${field}`]),
          weight: parseInt(data[`weight_${field}`]),
        };
      }),
    };
    await AddJobTaka(newData);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    setFocus,
  } = useForm({
    defaultValues: {
      company_id: null,
      challan_date: dayjs(),
      delivery_address: "",
      gst_state: "",
      gst_in_1: "",
      gst_in_2: "",
      challan_no: "",
      gray_order_id: null,
      supplier_name: null,
      supplier_id: null,
      broker_id: null,
      broker_name: "",
      quality_id: null,
      total_meter: "",
      total_weight: "",
      total_taka: "",
      is_grey: true,
    },
    resolver: addJobTakaSchemaResolver,
  });
  const { supplier_name, gray_order_id, company_id, supplier_id } = watch();

  // ------------------------------------------------------------------------------------------

  // const addNewFieldRow = (indexValue) => {
  //   let isValid = true;

  //   fieldArray.forEach((item, index) => {
  //     clearErrors(`taka_no_${index}`);
  //     clearErrors(`meter_${index}`);
  //     clearErrors(`weight_${index}`);
  //   });

  //   fieldArray.forEach((item, index) => {
  //     if (index === indexValue) {
  //       if (!getValues(`taka_no_${index}`)) {
  //         setError(`taka_no_${index}`, {
  //           type: "manual",
  //           message: "Please enter taka no",
  //         });
  //         isValid = false;
  //       }
  //       if (!getValues(`meter_${index}`)) {
  //         setError(`meter_${index}`, {
  //           type: "manual",
  //           message: "Please enter meter.",
  //         });
  //         isValid = false;
  //       }
  //       if (!getValues(`weight_${index}`)) {
  //         setError(`weight_${index}`, {
  //           type: "manual",
  //           message: "Please enter weight.",
  //         });
  //         isValid = false;
  //       }
  //     }
  //   });

  //   if (isValid) {
  //     const nextValue = fieldArray[fieldArray.length - 1] + 1;
  //     setFieldArray((prev) => {
  //       return [...prev, nextValue];
  //     });
  //   }
  // };

  // const deleteFieldRow = (field) => {
  //   const newFields = [...fieldArray];
  //   const actualIndex = newFields.indexOf(field);
  //   newFields.splice(actualIndex, 1);
  //   setFieldArray(newFields);
  // };

  const { data: dropDownQualityListRes, dropDownQualityLoading } = useQuery({
    queryKey: [
      "dropDownQualityListRes",
      "list",
      {
        company_id: companyId,
        page: 0,
        pageSize: 9999,
        is_active: 1,
      },
    ],
    queryFn: async () => {
      const res = await getInHouseQualityListRequest({
        params: {
          company_id: companyId,
          page: 0,
          pageSize: 9999,
          is_active: 1,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { data: grayOrderListRes, isLoading: isLoadingGrayOrderList } =
    useQuery({
      queryKey: ["party", "list", { company_id: companyId, order_type: "job" }],
      queryFn: async () => {
        const res = await getMyOrderListRequest({
          params: { company_id: companyId, order_type: "job" },
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

  const dropDownSupplierCompanyOption = useMemo(() => {
    if (
      supplier_name &&
      dropdownSupplierListRes &&
      dropdownSupplierListRes.length
    ) {
      const obj = dropdownSupplierListRes.find((item) => {
        return item.supplier_name === supplier_name;
      });
      // return obj?.supplier_company?.map((item) => {
      //   return { label: item.supplier_company, value: item.supplier_id };
      // });
      return obj?.supplier_company;
    } else {
      return [];
    }
  }, [supplier_name, dropdownSupplierListRes]);

  useEffect(() => {
    if (grayOrderListRes && gray_order_id) {
      const order = grayOrderListRes.row.find(({ id }) => gray_order_id === id);
      setSelectedOrder(order);
      setValue("total_meter", order.total_meter);
      setValue("total_taka", order.total_taka);
      setValue("total_weight", order.weight);
      setValue(
        "broker_name",
        `${order.broker.first_name} ${order.broker.last_name}`
      );
      setValue("broker_id", order.broker.id);
      setValue("quality_id", order.inhouse_quality.id);
      setValue("supplier_name", order.supplier_name);
      setValue("pending_meter", order.pending_meter);

      setPendingMeter(order.pending_meter);
      setPendingTaka(order.pending_taka);
    }
  }, [gray_order_id, grayOrderListRes, setValue]);

  useEffect(() => {
    if (company_id) {
      const selectedCompany = companyListRes?.rows?.find(
        ({ id }) => id === company_id
      );
      setValue("gst_in_1", selectedCompany.gst_no);
    }
  }, [companyListRes, company_id, setValue]);

  useEffect(() => {
    if (supplier_id) {
      const selectedSupplierCompany = dropDownSupplierCompanyOption.find(
        (item) => item.supplier_id === supplier_id
      );
      setValue("delivery_address", selectedSupplierCompany?.users?.address);
      setValue("gst_in_2", selectedSupplierCompany?.users?.gst_no);
    }
  }, [supplier_id, dropDownSupplierCompanyOption, setValue]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Create Job Taka</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={6}>
            <Form.Item
              label="Company"
              name="company_id"
              validateStatus={errors.company_id ? "error" : ""}
              help={errors.company_id && errors.company_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="company_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    loading={isLoadingGrayOrderList}
                    placeholder="Select Company"
                    options={companyListRes?.rows?.map((company) => ({
                      label: company.company_name,
                      value: company.id,
                    }))}
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
              label="Challan Date"
              name="challan_date"
              validateStatus={errors.challan_date ? "error" : ""}
              help={errors.challan_date && errors.challan_date.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="challan_date"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    style={{ width: "100%" }}
                    format={"DD-MM-YYYY"}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Delivery Address"
              name="delivery_address"
              validateStatus={errors.delivery_address ? "error" : ""}
              help={errors.delivery_address && errors.delivery_address.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="delivery_address"
                render={({ field }) => {
                  return (
                    <Input {...field} placeholder="Delivery Address" disabled />
                  );
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={6}>
            <Form.Item
              label="Gst State"
              name="gst_state"
              validateStatus={errors.gst_state ? "error" : ""}
              help={errors.gst_state && errors.gst_state.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="gst_state"
                render={({ field }) => (
                  <Input {...field} placeholder="GST State" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Gst In"
              name="gst_in_1"
              validateStatus={errors.gst_in_1 ? "error" : ""}
              help={errors.gst_in_1 && errors.gst_in_1.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="gst_in_1"
                render={({ field }) => (
                  <Input {...field} placeholder="GST In" disabled />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Challan No"
              name="challan_no"
              validateStatus={errors.challan_no ? "error" : ""}
              help={errors.challan_no && errors.challan_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="challan_no"
                render={({ field }) => (
                  <Input {...field} placeholder="CH123456" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Gst In"
              name="gst_in_2"
              validateStatus={errors.gst_in_2 ? "error" : ""}
              help={errors.gst_in_2 && errors.gst_in_2.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="gst_in_2"
                render={({ field }) => (
                  <Input {...field} placeholder="GST In" disabled />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={6}>
            <Form.Item
              label="Order"
              name="gray_order_id"
              validateStatus={errors.gray_order_id ? "error" : ""}
              help={errors.gray_order_id && errors.gray_order_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="gray_order_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    loading={isLoadingGrayOrderList}
                    placeholder="Select Order"
                    options={grayOrderListRes?.row?.map((order) => ({
                      label: order.order_no,
                      value: order.id,
                    }))}
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
              label="Broker"
              name="broker_name"
              validateStatus={errors.broker_name ? "error" : ""}
              help={errors.broker_name && errors.broker_name.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="broker_name"
                render={({ field }) => (
                  <Input {...field} placeholder="Broker Name" disabled />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Select Quality"
              name="quality_id"
              validateStatus={errors.quality_id ? "error" : ""}
              help={errors.quality_id && errors.quality_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="quality_id"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      placeholder="Select Quality"
                      loading={dropDownQualityLoading}
                      disabled
                      options={
                        dropDownQualityListRes &&
                        dropDownQualityListRes?.rows?.map((item) => ({
                          value: item.id,
                          label: item.quality_name,
                        }))
                      }
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>

          {/* <Col span={6}>
            <Form.Item
              label="Gst State"
              name="gst_state"
              validateStatus={errors.gst_state ? "error" : ""}
              help={errors.gst_state && errors.gst_state.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="gst_state"
                render={({ field }) => (
                  <Input {...field} placeholder="GST State" />
                )}
              />
            </Form.Item>
          </Col> */}
        </Row>

        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={6}>
            <Form.Item
              label="Select Supplier"
              name="supplier_name"
              validateStatus={errors.supplier_name ? "error" : ""}
              help={errors.supplier_name && errors.supplier_name.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="supplier_name"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Supplier"
                    disabled={selectedOrder?.supplier_name ? true : false}
                    loading={isLoadingDropdownSupplierList}
                    options={dropdownSupplierListRes?.map((supervisor) => ({
                      label: supervisor?.supplier_name,
                      value: supervisor?.supplier_name,
                    }))}
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
              label="Company"
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
                    placeholder="Select Company"
                    options={dropDownSupplierCompanyOption.map(
                      ({ supplier_id, supplier_company }) => {
                        return { label: supplier_company, value: supplier_id };
                      }
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

          <Col span={3}>
            <Form.Item
              label="Total Meter"
              name="total_meter"
              validateStatus={errors.total_meter ? "error" : ""}
              help={errors.total_meter && errors.total_meter.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="total_meter"
                render={({ field }) => (
                  <Input {...field} placeholder="0" disabled />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item
              label="Total Weight"
              name="total_weight"
              validateStatus={errors.total_weight ? "error" : ""}
              help={errors.total_weight && errors.total_weight.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="total_weight"
                render={({ field }) => (
                  <Input {...field} placeholder="0" disabled />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item
              label="Total Taka"
              name="total_taka"
              validateStatus={errors.total_taka ? "error" : ""}
              help={errors.total_taka && errors.total_taka.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="total_taka"
                render={({ field }) => (
                  <Input {...field} placeholder="0" disabled />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        {pendingMeter && pendingTaka ? (
          <Row
            gutter={18}
            style={{
              padding: "12px",
            }}
          >
            <Col span={6}></Col>

            <Col span={6} style={{ textAlign: "end" }}>
              <Typography style={{ color: "red" }}>Pending</Typography>
            </Col>

            <Col span={3} style={{ textAlign: "center" }}>
              <Typography style={{ color: "red" }}>{pendingMeter}</Typography>
            </Col>

            <Col span={3} style={{ textAlign: "center" }}>
              <Typography style={{ color: "red" }}>0</Typography>
            </Col>

            <Col span={3} style={{ textAlign: "center" }}>
              <Typography style={{ color: "red" }}>{pendingTaka}</Typography>
            </Col>
          </Row>
        ) : null}

        <Divider />

        <FieldTable
          errors={errors}
          control={control}
          setFocus={setFocus}
          setValue={setValue}
          activeField={activeField}
          setActiveField={setActiveField}
        />

        {/* {fieldArray.map((field, index) => {
          return (
            <Row
              gutter={18}
              style={{
                padding: "12px",
              }}
              key={`${field}_add_job_taka`}
            >
              <Col span={3}>
                <Form.Item
                  label="Taka No"
                  name={`taka_no_${field}`}
                  validateStatus={errors[`taka_no_${field}`] ? "error" : ""}
                  help={
                    errors[`taka_no_${field}`] &&
                    errors[`taka_no_${field}`].message
                  }
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name={`taka_no_${field}`}
                    render={({ field }) => <Input {...field} placeholder="1" />}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label="Meter"
                  name={`meter_${field}`}
                  validateStatus={errors[`meter_${field}`] ? "error" : ""}
                  help={
                    errors[`meter_${field}`] && errors[`meter_${field}`].message
                  }
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name={`meter_${field}`}
                    render={({ field }) => (
                      <Input {...field} placeholder="23" />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label="Weight"
                  name={`weight_${field}`}
                  validateStatus={errors[`weight_${field}`] ? "error" : ""}
                  help={
                    errors[`weight_${field}`] &&
                    errors[`weight_${field}`].message
                  }
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name={`weight_${field}`}
                    render={({ field }) => (
                      <Input {...field} placeholder="23" />
                    )}
                  />
                </Form.Item>
              </Col>

              {fieldArray.length > 1 && (
                <Col span={1}>
                  <Button
                    style={{ marginTop: "1.9rem" }}
                    icon={<DeleteOutlined />}
                    type="primary"
                    onClick={deleteFieldRow.bind(null, field)}
                    className="flex-none"
                  />
                </Col>
              )}

              {index === fieldArray.length - 1 && (
                <Col span={1}>
                  <Button
                    style={{ marginTop: "1.9rem" }}
                    icon={<PlusOutlined />}
                    type="primary"
                    onClick={addNewFieldRow.bind(null, index)}
                    className="flex-none"
                  />
                </Col>
              )}
            </Row>
          );
        })} */}

        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Create
          </Button>
        </Flex>
      </Form>
    </div>
  );
};

export default AddJobTaka;
