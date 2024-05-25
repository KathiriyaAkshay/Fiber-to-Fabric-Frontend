import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  Row,
  Select,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { getInHouseQualityListRequest } from "../../../api/requests/qualityMaster";
import {
  getBrokerListRequest,
  getDropdownSupplierListRequest,
} from "../../../api/requests/users";
// import { useCurrentUser } from "../../../../api/hooks/auth";
import { getMyOrderListRequest } from "../../../api/requests/orderMaster";
import {
  getJobTakaByIdRequest,
  updateJobTakaRequest,
} from "../../../api/requests/job/jobTaka";

const addJobTakaSchemaResolver = yupResolver(
  yup.object().shape({
    delivery_address: yup.string().required("Please enter delivery address."),
    gst_state: yup.string().required("Please enter GST State."),
    gst_in: yup.string().required("Please enter GST In."),
    challan_no: yup.string().required("Please enter challan no."),
    gray_order_id: yup.string().required("Please select order."),
    supplier_id: yup.string().required("Please select supplier."),
    broker_id: yup.string().required("Please select broker."),
    quality_id: yup.string().required("Please select quality."),
    total_meter: yup.string().required("Please enter total meter."),
    total_weight: yup.string().required("Please enter total weight."),
    pending_meter: yup.string().required("Please enter pending meter."),
    pending_weight: yup.string().required("Please enter pending weight."),
    pending_taka: yup.string().required("Please enter pending taka."),
    total_taka: yup.string().required("Please enter total taka."),
  })
);

const UpdateJobTaka = () => {
  const params = useParams();
  const { id } = params;

  const queryClient = useQueryClient();
  const [fieldArray, setFieldArray] = useState([0]);

  const navigate = useNavigate();
  //   const { data: user } = useCurrentUser();
  const { companyId } = useContext(GlobalContext);
  function goBack() {
    navigate(-1);
  }

  const { data: jobTakaDetails } = useQuery({
    queryKey: ["yarnSentDetail", "get", id, { company_id: companyId }],
    queryFn: async () => {
      const res = await getJobTakaByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: updateJobTaka, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await updateJobTakaRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["job", "taka", "update"],
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
    const newData = {
      delivery_address: data.delivery_address,
      gst_state: data.gst_state,
      gst_in: data.gst_in,
      challan_no: data.challan_no,
      gray_order_id: parseInt(data.gray_order_id),
      supplier_id: parseInt(data.supplier_id),
      broker_id: parseInt(data.broker_id),
      quality_id: parseInt(data.quality_id),
      total_meter: parseInt(data.total_meter),
      total_weight: parseInt(data.total_weight),
      pending_meter: parseInt(data.pending_meter),
      pending_weight: parseInt(data.pending_weight),
      pending_taka: parseInt(data.pending_taka),
      total_taka: parseInt(data.total_taka),
      is_grey: data.is_grey,
      job_challan_detail: fieldArray.map((field) => {
        return {
          taka_no: parseInt(data[`taka_no_${field}`]),
          meter: parseInt(data[`meter_${field}`]),
          weight: parseInt(data[`weight_${field}`]),
        };
      }),
    };
    await updateJobTaka(newData);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setError,
    getValues,
    reset,
  } = useForm({
    defaultValues: {
      delivery_address: "",
      gst_state: "",
      gst_in: "",
      challan_no: "",
      gray_order_id: null,
      supplier_id: null,
      broker_id: null,
      quality_id: null,
      total_meter: "",
      total_weight: "",
      pending_meter: "",
      pending_weight: "",
      pending_taka: "",
      total_taka: "",
      is_grey: true,
    },
    resolver: addJobTakaSchemaResolver,
  });

  useEffect(() => {
    if (jobTakaDetails) {
      const {
        challan_no,
        delivery_address,
        gst_in,
        gst_state,
        quality_id,
        broker_id,
        supplier_id,
        gray_order_id,
        total_meter,
        total_taka,
        total_weight,
        is_grey,
        job_challan_details,
        gray_order,
      } = jobTakaDetails;
      console.log(quality_id);

      setFieldArray(() => {
        return job_challan_details.map((item, index) => index);
      });
      let jobChallanDetails = {};
      job_challan_details.forEach((item, index) => {
        jobChallanDetails[`taka_no_${index}`] = item.taka_no;
        jobChallanDetails[`meter_${index}`] = item.meter;
        jobChallanDetails[`weight_${index}`] = item.weight;
      });
      reset({
        challan_no,
        delivery_address,
        gst_in,
        gst_state,
        quality_id,
        broker_id,
        supplier_id,
        gray_order_id,
        total_meter,
        total_taka,
        total_weight,
        pending_meter: gray_order.pending_meter,
        pending_taka: gray_order.pending_taka,
        pending_weight: gray_order.pending_weight,
        is_grey,
        ...jobChallanDetails,
      });
    }
  }, [jobTakaDetails, reset]);

  // ------------------------------------------------------------------------------------------

  const addNewFieldRow = (indexValue) => {
    let isValid = true;

    fieldArray.forEach((item, index) => {
      clearErrors(`taka_no_${index}`);
      clearErrors(`meter_${index}`);
      clearErrors(`weight_${index}`);
    });

    fieldArray.forEach((item, index) => {
      if (index === indexValue) {
        if (!getValues(`taka_no_${index}`)) {
          setError(`taka_no_${index}`, {
            type: "manual",
            message: "Please enter taka no",
          });
          isValid = false;
        }
        if (!getValues(`meter_${index}`)) {
          setError(`meter_${index}`, {
            type: "manual",
            message: "Please enter meter.",
          });
          isValid = false;
        }
        if (!getValues(`weight_${index}`)) {
          setError(`weight_${index}`, {
            type: "manual",
            message: "Please enter weight.",
          });
          isValid = false;
        }
      }
    });

    if (isValid) {
      const nextValue = fieldArray[fieldArray.length - 1] + 1;
      setFieldArray((prev) => {
        return [...prev, nextValue];
      });
    }
  };

  const deleteFieldRow = (field) => {
    const newFields = [...fieldArray];
    const actualIndex = newFields.indexOf(field);
    newFields.splice(actualIndex, 1);
    setFieldArray(newFields);
  };

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
  console.log({ dropDownQualityListRes });

  const { data: brokerUserListRes, isLoading: isLoadingBrokerList } = useQuery({
    queryKey: ["broker", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getBrokerListRequest({
        params: { company_id: companyId, page: 0, pageSize: 99999 },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { data: grayOrderListRes, isLoading: isLoadingGrayOrderList } =
    useQuery({
      queryKey: ["party", "list", { company_id: companyId }],
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

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Update Job Taka</h3>
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
                  return <Input {...field} placeholder="Delivery Address" />;
                }}
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
              name="gst_in"
              validateStatus={errors.gst_in ? "error" : ""}
              help={errors.gst_in && errors.gst_in.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="gst_in"
                render={({ field }) => (
                  <Input {...field} placeholder="GST In" />
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
              label="Select Supplier"
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
                    placeholder="Select Supplier"
                    loading={isLoadingDropdownSupplierList}
                    options={dropdownSupplierListRes?.map((supervisor) => ({
                      label: supervisor?.supplier_name,
                      value: supervisor?.supplier_company[0]?.supplier_id,
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
              label="Select Broker"
              name="broker_id"
              validateStatus={errors.broker_id ? "error" : ""}
              help={errors.broker_id && errors.broker_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="broker_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    loading={isLoadingBrokerList}
                    placeholder="Select Broker"
                    options={brokerUserListRes?.brokerList?.rows?.map(
                      (broker) => ({
                        label:
                          broker.first_name +
                          " " +
                          broker.last_name +
                          " " +
                          `| (${broker?.username})`,
                        value: broker.id,
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
        </Row>

        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
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
                render={({ field }) => <Input {...field} placeholder="0" />}
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
                render={({ field }) => <Input {...field} placeholder="0" />}
              />
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item
              label="Pending Meter"
              name="pending_meter"
              validateStatus={errors.pending_meter ? "error" : ""}
              help={errors.pending_meter && errors.pending_meter.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="pending_meter"
                render={({ field }) => <Input {...field} placeholder="0" />}
              />
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item
              label="Pending Weight"
              name="pending_weight"
              validateStatus={errors.pending_weight ? "error" : ""}
              help={errors.pending_weight && errors.pending_weight.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="pending_weight"
                render={({ field }) => <Input {...field} placeholder="0" />}
              />
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item
              label="Pending Taka"
              name="pending_taka"
              validateStatus={errors.pending_taka ? "error" : ""}
              help={errors.pending_taka && errors.pending_taka.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="pending_taka"
                render={({ field }) => <Input {...field} placeholder="0" />}
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
                render={({ field }) => <Input {...field} placeholder="0" />}
              />
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item
              label=" "
              name="is_grey"
              validateStatus={errors.is_grey ? "error" : ""}
              help={errors.is_grey && errors.is_grey.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="is_grey"
                render={({ field }) => (
                  <Checkbox {...field} checked={field.value}>
                    {" "}
                    Is Grey{" "}
                  </Checkbox>
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {fieldArray.map((field, index) => {
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
        })}

        <Flex gap={10} justify="flex-end">
          <Button type="primary" htmlType="submit" loading={isPending}>
            Update
          </Button>
        </Flex>
      </Form>
    </div>
  );
};

export default UpdateJobTaka;
