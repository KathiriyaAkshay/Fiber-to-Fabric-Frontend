import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Radio,
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
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import {
  getDropdownSupplierListRequest,
  getVehicleUserListRequest,
} from "../../../../api/requests/users";
// import { useCurrentUser } from "../../../../api/hooks/auth";
import { getMyOrderListRequest } from "../../../../api/requests/orderMaster";
import dayjs from "dayjs";
import { createSaleChallanRequest } from "../../../../api/requests/sale/challan/challan";
import SaleChallanFieldTable from "../../../../components/sale/challan/saleChallan/SaleChallanFieldTable";

const addJobTakaSchemaResolver = yupResolver(
  yup.object().shape({
    delivery_address: yup.string().required("Please enter delivery address."),
    gst_state: yup.string().required("Please enter GST State."),
    gst_state_2: yup.string().required("Please enter GST State."),
    gst_in_1: yup.string().required("Please enter GST In."),
    gst_in_2: yup.string().required("Please enter GST In."),
    challan_no: yup.string().required("Please enter challan no."),
    gray_order_id: yup.string().required("Please select order."),
    supplier_id: yup.string().required("Please select supplier."),
    vehicle_id: yup.string().required("Please select vehicle."),
    broker_id: yup.string().required("Please select broker."),
    quality_id: yup.string().required("Please select quality."),
    total_meter: yup.string().required("Please enter total meter."),
    total_weight: yup.string().required("Please enter total weight."),
    total_taka: yup.string().required("Please enter total taka."),
    delivery_note: yup.string().required("Please enter delivery notes."),
  })
);

const AddSaleChallan = () => {
  const queryClient = useQueryClient();
  // const [fieldArray, setFieldArray] = useState([0]);

  const [totalTaka, setTotalTaka] = useState(0);
  const [totalMeter, setTotalMeter] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

  const [activeField, setActiveField] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pendingMeter, setPendingMeter] = useState(0);
  const [pendingTaka, setPendingTaka] = useState(0);
  const [pendingWeight, setPendingWeight] = useState(0);

  const navigate = useNavigate();
  //   const { data: user } = useCurrentUser();
  const { companyId, companyListRes } = useContext(GlobalContext);
  function goBack() {
    navigate(-1);
  }

  const { mutateAsync: AddSaleChallan, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await createSaleChallanRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["sale", "challan", "add"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["saleChallan", "list", companyId]);
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
    const saleChallanDetailArr = Array.from(
      { length: activeField },
      (_, i) => i + 1
    );

    const newData = {
      party_id: selectedOrder.party_id,
      customer_gst_state: data.gst_state_2,
      is_gray: data.is_gray === "true" ? true : false,
      challan_type: data.challan_type,
      challan_no: data.challan_no,
      createdAt: dayjs(data.challan_date).format("YYYY-MM-DD"),
      company_gst_state: data.gst_state,
      delivery_address: data.delivery_address,
      gray_order_id: +data.gray_order_id,
      broker_id: +data.broker_id,
      quality_id: +data.quality_id,
      vehicle_id: +data.vehicle_id,
      supplier_id: +data.supplier_id,
      delivery_note: data.delivery_note,

      pending_meter: +pendingMeter,
      pending_weight: +pendingWeight,
      pending_taka: +pendingTaka,

      total_taka: +totalTaka,
      total_meter: +totalMeter,
      total_weight: +totalWeight,

      sale_challan_types: data.type.map((type) => {
        return {
          sale_challan_type: type,
        };
      }),
      sale_challan_details: saleChallanDetailArr.map((field, index) => {
        return {
          index: index + 1,
          taka_no: data[`taka_no_${field}`],
          meter: parseInt(data[`meter_${field}`]),
          weight: parseInt(data[`weight_${field}`]),
          model: data[`model_${field}`],
        };
      }),
    };
    await AddSaleChallan(newData);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    setFocus,
    resetField,
    getValues,
  } = useForm({
    defaultValues: {
      company_id: null,
      challan_type: "normal",
      challan_date: dayjs(),
      challan_no: "",

      delivery_address: "",
      gst_state: "",
      gst_state_2: "",
      gst_in_1: "",
      gst_in_2: "",

      gray_order_id: null,
      supplier_name: null,
      supplier_id: null,
      broker_id: null,
      broker_name: "",
      quality_id: null,
      vehicle_id: null,

      total_meter: "",
      total_weight: "",
      total_taka: "",
      is_gray: "true",
      delivery_note: "",

      type: ["taka(inhouse)"],
    },
    resolver: addJobTakaSchemaResolver,
  });
  const { supplier_name, gray_order_id, company_id, supplier_id, type } =
    watch();

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
      queryKey: [
        "party",
        "list",
        { company_id: companyId, order_type: "taka(inhouse)" },
      ],
      queryFn: async () => {
        const res = await getMyOrderListRequest({
          params: { company_id: companyId, order_type: "taka(inhouse)" },
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
      resetField("supplier_id");
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
  }, [supplier_name, dropdownSupplierListRes, resetField]);

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

      // setPendingMeter(order.pending_meter);
      // setPendingTaka(order.pending_taka);
      // setPendingWeight(order.pending_weight);
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

  useEffect(() => {
    if (grayOrderListRes && gray_order_id) {
      const order = grayOrderListRes.row.find(({ id }) => gray_order_id === id);

      setPendingMeter(+order.pending_meter - +totalMeter);
      setPendingTaka(+order.pending_taka - +totalTaka);
      setPendingWeight(+order.pending_weight - +totalWeight);
    }
  }, [grayOrderListRes, gray_order_id, totalMeter, totalTaka, totalWeight]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <Button onClick={goBack}>
            <ArrowLeftOutlined />
          </Button>
          <h3 className="m-0 text-primary">Create Sale Challan</h3>
        </div>
        <Form.Item
          label=""
          name="is_gray"
          validateStatus={errors.is_gray ? "error" : ""}
          help={errors.is_gray && errors.is_gray.message}
          required={true}
          wrapperCol={{ sm: 24 }}
        >
          <Controller
            control={control}
            name="is_gray"
            render={({ field }) => {
              return (
                <Radio.Group {...field}>
                  <Radio value={"true"}>Grey</Radio>
                  <Radio value={"false"}>Cash</Radio>
                </Radio.Group>
              );
            }}
          />
        </Form.Item>
      </div>
      {/* <Form layout="vertical" onFinish={handleSubmit(onSubmit)}> */}
      <Row
        gutter={18}
        style={{
          paddingTop: "12px",
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
            label="Challan Type"
            name="challan_type"
            validateStatus={errors.challan_type ? "error" : ""}
            help={errors.challan_type && errors.challan_type.message}
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name="challan_type"
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select Challan type"
                  options={[
                    { label: "Normal Challan", value: "normal_challan" },
                    { label: "lotwise Challan", value: "lotwise_challan" },
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
      </Row>

      <Row
        gutter={18}
        style={
          {
            // padding: "12px",
          }
        }
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
        style={
          {
            // padding: "12px",
          }
        }
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

        <Col span={6}>
          <Form.Item
            label="Vehicle"
            name="vehicle_id"
            validateStatus={errors.vehicle_id ? "error" : ""}
            help={errors.vehicle_id && errors.vehicle_id.message}
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name="vehicle_id"
              rules={{ required: "Vehicle is required." }}
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
      </Row>

      <Row
        gutter={18}
        style={
          {
            // padding: "12px",
          }
        }
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

      {gray_order_id ? (
        <Row
          gutter={18}
          style={
            {
              // padding: "12px",
            }
          }
        >
          <Col span={6}></Col>

          <Col span={6} style={{ textAlign: "end" }}>
            <Typography style={{ color: "red" }}>Pending</Typography>
          </Col>

          <Col span={3} style={{ textAlign: "center" }}>
            <Typography style={{ color: "red" }}>{pendingMeter}</Typography>
          </Col>

          <Col span={3} style={{ textAlign: "center" }}>
            <Typography style={{ color: "red" }}>{pendingWeight}</Typography>
          </Col>

          <Col span={3} style={{ textAlign: "center" }}>
            <Typography style={{ color: "red" }}>{pendingTaka}</Typography>
          </Col>
        </Row>
      ) : null}

      <Row
        gutter={18}
        style={{
          padding: "12px",
        }}
      >
        <Col span={6}>
          <Form.Item
            label="Gst State"
            name="gst_state_2"
            validateStatus={errors.gst_state_2 ? "error" : ""}
            help={errors.gst_state_2 && errors.gst_state_2.message}
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name="gst_state_2"
              render={({ field }) => (
                <Input {...field} placeholder="GST State" />
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
              render={({ field }) => <Input {...field} placeholder="GST In" />}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Delivery Notes"
            name="delivery_note"
            validateStatus={errors.delivery_note ? "error" : ""}
            help={errors.delivery_note && errors.delivery_note.message}
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name="delivery_note"
              render={({ field }) => {
                return (
                  <Input {...field} placeholder="Delivery Notes" multiple />
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
        <Col span={12}>
          <Form.Item
            label="Type"
            name="type"
            validateStatus={errors.type ? "error" : ""}
            help={errors.type && errors.type.message}
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name="type"
              render={({ field }) => {
                return (
                  <Checkbox.Group
                    {...field}
                    options={[
                      { label: "Taka(In House)", value: "taka(inhouse)" },
                      { label: "Purchase/Trading", value: "purchase/trading" },
                      { label: "Job", value: "job" },
                      {
                        label: "Sale Multiple Production",
                        value: "sale_multiple_production",
                      },
                    ]}
                  >
                    {/* <Radio value={"taka(inhouse)"}>Taka(In House)</Radio>
                    <Radio value={"purchase/trading"}>Purchase/Trading</Radio>
                    <Radio value={"job"}>Job</Radio>
                    <Radio value={"sale_multiple_production"}>
                      Sale Multiple Production
                    </Radio> */}
                  </Checkbox.Group>
                );
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      <SaleChallanFieldTable
        errors={errors}
        control={control}
        setFocus={setFocus}
        setValue={setValue}
        activeField={activeField}
        setActiveField={setActiveField}
        type={type}
        companyId={companyId}
        getValues={getValues}
        setTotalMeter={setTotalMeter}
        setTotalTaka={setTotalTaka}
        setTotalWeight={setTotalWeight}
        setPendingMeter={setPendingMeter}
        setPendingTaka={setPendingTaka}
        setPendingWeight={setPendingWeight}
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
        <Button htmlType="button" onClick={() => reset()}>
          Reset
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={isPending}
          onClick={handleSubmit(onSubmit)}
        >
          Create
        </Button>
      </Flex>
      {/* </Form> */}
    </div>
  );
};

export default AddSaleChallan;
