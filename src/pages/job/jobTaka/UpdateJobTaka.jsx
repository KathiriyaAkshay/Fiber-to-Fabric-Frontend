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
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { getInHouseQualityListRequest } from "../../../api/requests/qualityMaster";
import { getDropdownSupplierListRequest } from "../../../api/requests/users";
// import { useCurrentUser } from "../../../../api/hooks/auth";
import { getMyOrderListRequest } from "../../../api/requests/orderMaster";
import {
  getJobTakaByIdRequest,
  updateJobTakaRequest,
} from "../../../api/requests/job/jobTaka";
import FieldTable from "../../../components/fieldTable";
import dayjs from "dayjs";
import moment from "moment";
import { checkUniqueTakaNoRequest } from "../../../api/requests/purchase/purchaseTaka";

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

const UpdateJobTaka = () => {
  const params = useParams();
  const { id } = params;

  const queryClient = useQueryClient();
  const [activeField, setActiveField] = useState(1);
  // const [fieldArray, setFieldArray] = useState([0]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  console.log({ selectedOrder });

  const [isTakaExist, setIsTakaExist] = useState(false);

  const [totalTaka, setTotalTaka] = useState(0);
  const [totalMeter, setTotalMeter] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

  const [pendingMeter, setPendingMeter] = useState("");
  const [pendingTaka, setPendingTaka] = useState("");
  const [pendingWeight, setPendingWeight] = useState("");

  const navigate = useNavigate();
  //   const { data: user } = useCurrentUser();
  const { companyId, companyListRes } = useContext(GlobalContext);
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
    const jobChallanDetailArr = Array.from(
      { length: activeField },
      (_, i) => i + 1
    );

    const job_challan_detail = [];
    jobChallanDetailArr.forEach((field) => {
      if (
        !isNaN(data[`taka_no_${field}`]) &&
        !isNaN(data[`meter_${field}`]) &&
        !isNaN(data[`weight_${field}`])
      ) {
        job_challan_detail.push({
          taka_no: parseInt(data[`taka_no_${field}`]),
          meter: parseInt(data[`meter_${field}`]),
          weight: parseInt(data[`weight_${field}`]),
        });
      }
    });

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
      total_weight: parseInt(data.total_weight || 0),
      pending_meter: parseInt(data.pending_meter || 0),
      pending_weight: parseInt(data.pending_weight || 0),
      pending_taka: parseInt(data.pending_taka || 0),
      total_taka: parseInt(data.total_taka),
      is_grey: true,
      job_challan_detail: job_challan_detail,
    };
    await updateJobTaka(newData);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    setFocus,
    reset,
    watch,
    clearErrors,
    getValues,
    setError,
  } = useForm({
    defaultValues: {
      // company_id: null,
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
  // const { supplier_name } = watch();
  const { supplier_name, gray_order_id, supplier_id } = watch();

  const { data: dropDownQualityListRes, isLoading: dropDownQualityLoading } =
    useQuery({
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

  const dropDownSupplierCompanyOption = useMemo(() => {
    if (
      supplier_name &&
      dropdownSupplierListRes &&
      dropdownSupplierListRes.length
    ) {
      const obj = dropdownSupplierListRes.find((item) => {
        return item.supplier_name === supplier_name;
      });
      return obj?.supplier_company;
    } else {
      return [];
    }
  }, [supplier_name, dropdownSupplierListRes]);

  function disabledFutureDate(current) {
    // Disable dates after today
    return current && current > moment().endOf("day");
  }

  const checkUniqueTakaHandler = async (takaNo, fieldNumber) => {
    try {
      const params = { company_id: companyId, taka_no: +takaNo };
      const response = await checkUniqueTakaNoRequest({ params });
      if (response.data.success) {
        setIsTakaExist(false);
        clearErrors(`taka_no_${fieldNumber}`);
      }
    } catch (error) {
      if (!error.response.data.success) {
        message.error(error.response.data.message);
        setIsTakaExist(true);
        setError(`taka_no_${fieldNumber}`, {
          type: "manual",
          message: "Taka No already exist.",
        });
      }
    }
  };

  useEffect(() => {
    if (gray_order_id) {
      setActiveField((prev) => (prev === 0 ? 1 : prev));
    } else {
      setActiveField(0);
    }
  }, [gray_order_id]);

  useEffect(() => {
    if (grayOrderListRes && gray_order_id) {
      const order = grayOrderListRes.row.find(({ id }) => gray_order_id === id);
      if (order) {
        setPendingMeter(+order.pending_meter);
        setPendingTaka(+order.pending_taka );
        setPendingWeight(+order.pending_weight);
      }
    }
  }, [grayOrderListRes, gray_order_id, totalMeter, totalTaka, totalWeight]);

  useEffect(() => {
    if (grayOrderListRes && gray_order_id) {
      const order = grayOrderListRes.row.find(({ id }) => gray_order_id === id);
      setSelectedOrder(order);
      setValue("total_meter", order?.total_meter);
      setValue("total_taka", order?.total_taka);
      setValue("total_weight", order?.weight);
      setValue(
        "broker_name",
        `${order?.broker?.first_name} ${order?.broker?.last_name}`
      );
      setValue("broker_id", order?.broker.id);
      setValue("quality_id", order?.inhouse_quality.id);
      // setValue("supplier_name", order?.supplier_name);
      setValue("pending_meter", order?.pending_meter);

      setPendingMeter(order?.pending_meter || 0);
      setPendingTaka(order?.pending_taka || 0);
      setPendingWeight(order?.pending_weight || 0);
    }
  }, [gray_order_id, grayOrderListRes, setValue]);

  useEffect(() => {
    if (companyId) {
      const selectedCompany = companyListRes?.rows?.find(
        ({ id }) => id === companyId
      );

      setValue("gst_in_1", selectedCompany.gst_no);
    }
  }, [companyListRes, companyId, setValue]);

  useEffect(() => {
    if (supplier_id) {
      const selectedSupplierCompany = dropDownSupplierCompanyOption.find(
        (item) => item.supplier_id === supplier_id
      );
      setValue("delivery_address", selectedSupplierCompany?.users?.address);
      setValue("gst_in_2", selectedSupplierCompany?.users?.gst_no);
    }
  }, [supplier_id, dropDownSupplierCompanyOption, setValue]);

  useEffect(() => {
    if (jobTakaDetails) {
      const {
        // company_id,
        challan_no,
        delivery_address,
        gst_in,
        gst_state,
        quality_id,
        supplier_id,
        gray_order_id,
        total_meter,
        total_taka,
        total_weight,
        is_grey,
        job_challan_details,
        supplier,
        createdAt,
        broker_id,
        broker,
      } = jobTakaDetails;

      setActiveField(job_challan_details.length + 1);
      let jobChallanDetails = {};
      job_challan_details.forEach((item, index) => {
        jobChallanDetails[`taka_no_${index + 1}`] = item.taka_no;
        jobChallanDetails[`meter_${index + 1}`] = item.meter;
        jobChallanDetails[`weight_${index + 1}`] = item.weight;

        setTotalTaka(job_challan_details.length);
        setTotalMeter((prev) => prev + +item.meter);
        setTotalWeight((prev) => prev + +item.weight);
      });
      reset({
        // company_id,
        challan_no,
        delivery_address,
        gst_in_1: gst_in,
        gst_in_2: gst_in,
        gst_state,
        quality_id,
        broker_id: broker_id,
        broker_name: `${broker.first_name} ${broker.last_name}`,
        supplier_id,
        gray_order_id,
        total_meter,
        total_taka,
        total_weight,
        // pending_meter: gray_order.pending_meter,
        // pending_taka: gray_order.pending_taka,
        // pending_weight: gray_order.pending_weight,
        is_grey,
        supplier_name: supplier.supplier_name,
        challan_date: dayjs(createdAt),
        ...jobChallanDetails,
      });
    }
  }, [jobTakaDetails, reset]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Update Job Taka</h3>
      </div>
      <Form layout="vertical">
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          {/* <Col span={6}>
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
                    disabled
                  />
                )}
              />
            </Form.Item>
          </Col> */}

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
                    disabledDate={disabledFutureDate}
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
            marginTop: "-30px",
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
            marginTop: "-30px",
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
                    disabled
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
            marginTop: "-30px",
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
                    disabled={true}
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
              marginTop: "-30px",
            }}
          >
            <Col span={6}></Col>

            <Col span={6} style={{ textAlign: "end" }}>
              <Typography style={{ color: "red" }}>Pending</Typography>
            </Col>

            <Col span={3} style={{ textAlign: "start" }}>
              <Typography style={{ color: "red" }}>{pendingMeter}</Typography>
            </Col>

            <Col span={3} style={{ textAlign: "start" }}>
              <Typography style={{ color: "red" }}>{pendingWeight}</Typography>
            </Col>

            <Col span={3} style={{ textAlign: "start" }}>
              <Typography style={{ color: "red" }}>{pendingTaka}</Typography>
            </Col>
          </Row>
        ) : null}

        <Divider style={{marginTop:-5}}/>

        <FieldTable
          errors={errors}
          control={control}
          setFocus={setFocus}
          setValue={setValue}
          activeField={activeField}
          setActiveField={setActiveField}
          checkUniqueTakaHandler={checkUniqueTakaHandler}
          isTakaExist={isTakaExist}
          setTotalMeter={setTotalMeter}
          setTotalWeight={setTotalWeight}
          setTotalTaka={setTotalTaka}
          getValues={getValues}
          clearErrors={clearErrors}
          isUpdate = {true}
        />

        <Row style={{ marginTop: "20px" }} gutter={20}>
          <Col span={6}>
            <Form.Item label="Total Taka">
              <Input value={totalTaka} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Total Meter">
              <Input value={totalMeter} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Total Weight">
              <Input value={totalWeight} disabled />
            </Form.Item>
          </Col>
        </Row>

        <Flex gap={10} justify="flex-end" style={{ marginTop: "1rem" }}>
          <Button
            type="primary"
            htmlType="button"
            loading={isPending}
            onClick={handleSubmit(onSubmit)}
          >
            Update
          </Button>
        </Flex>
      </Form>
    </div>
  );
};

export default UpdateJobTaka;
