import {
  Button,
  Checkbox,
  Col,
  Flex,
  Row,
  Form,
  Select,
  Input,
  DatePicker,
  Typography,
  message,
  Divider,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { getInHouseQualityListRequest } from "../../api/requests/qualityMaster";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GlobalContext } from "../../contexts/GlobalContext";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  getPartyListRequest,
  getVehicleUserListRequest,
} from "../../api/requests/users";
import {
  addOpeningProductionRequest,
  // getLastOpeningProductionTakaRequest,
} from "../../api/requests/production/openingProduction";
import dayjs from "dayjs";
import AddOpeningProductionTable from "../../components/production/AddOpeningProductionTable";
import { useNavigate } from "react-router-dom";
import { getMyOrderListRequest } from "../../api/requests/orderMaster";
import { getCompanyMachineListRequest } from "../../api/requests/machine";
import { ArrowLeftOutlined, EyeOutlined } from "@ant-design/icons";
import { getLastProductionTakaRequest } from "../../api/requests/production/inhouseProduction";
import { disabledFutureDate } from "../../utils/date";

const OpenProduction = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { companyId, company } = useContext(GlobalContext);
  const [activeField, setActiveField] = useState(1);

  const [totalMeter, setTotalMeter] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalTaka, setTotalTaka] = useState(0);

  const [pendingMeter, setPendingMeter] = useState("");
  const [pendingTaka, setPendingTaka] = useState("");
  const [pendingWeight, setPendingWeight] = useState("");

  // Opening Production related handler ==========================
  const { mutateAsync: addNewOpeningProduction, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await addOpeningProductionRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "opening", "production"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["production", "list", companyId]);
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

  const onSubmit = async (data) => {
    const array = Array.from({ length: activeField }, (_, i) => i + 1);
    if (data.is_create_challan) {
      let hasError = 0;

      array.map((fieldNumber) => {
        let meter = +data[`meter_${fieldNumber}`];
        let weight = +data[`weight_${fieldNumber}`];
        let machine_no = +data[`machine_no_${fieldNumber}`];

        if (isNaN(meter) || meter == undefined || meter == "") {
          message.error(
            `Please, Enter valid details for Taka ${
              data.last_taka_no + fieldNumber
            }`
          );
          hasError = 1;
          return;
        } else if (isNaN(weight) || weight == undefined || weight == "") {
          message.error(
            `Please, Enter valid details for Taka ${
              data.last_taka_no + fieldNumber
            }`
          );
          hasError = 1;
          return;
        } else if (
          isNaN(machine_no) ||
          machine_no == undefined ||
          machine_no == ""
        ) {
          message.error(
            `Please, Enter valid details for Taka ${
              data.last_taka_no + fieldNumber
            }`
          );
          hasError = 1;
          return;
        }
      });

      if (hasError == 0) {
        const payload = {
          deliver_address: data.delivery_address,
          order_id: data.order_id,
          vehicle_id: data.vehicle_id,
          challan_no: data.challan_no,
          customer_gst: data.customer_gst_in,
          machine_name: data.machine_name,
          createdAt: dayjs(data.challan_date).format("YYYY-MM-DD"),

          // pending_meter: data.pending_meter - totalMeter,
          // pending_weight: data.pending_weight - totalWeight,
          // pending_taka: data.pending_taka - totalTaka,
          pending_meter: pendingMeter,
          pending_weight: pendingWeight,
          pending_taka: pendingTaka,

          total_meter: totalMeter,
          total_weight: totalWeight,
          total_taka: totalTaka,

          production_details: array.map((fieldNumber) => {
            return {
              taka_no: data.last_taka_no + fieldNumber,
              meter: +data[`meter_${fieldNumber}`],
              weight: +data[`weight_${fieldNumber}`],
              machine_no: data[`machine_no_${fieldNumber}`],
            };
          }),
        };
        await addNewOpeningProduction(payload);
      }
    } else {
      let hasError = 0;

      array.map((fieldNumber) => {
        let meter = +data[`meter_${fieldNumber}`];
        let weight = +data[`weight_${fieldNumber}`];
        let machine_no = +data[`machine_no_${fieldNumber}`];

        if (isNaN(meter) || meter == undefined || meter == "") {
          message.error(
            `Please, Enter valid details for Taka ${
              data.last_taka_no + fieldNumber
            }`
          );
          hasError = 1;
          return;
        } else if (isNaN(weight) || weight == undefined || weight == "") {
          message.error(
            `Please, Enter valid details for Taka ${
              data.last_taka_no + fieldNumber
            }`
          );
          hasError = 1;
          return;
        } else if (
          isNaN(machine_no) ||
          machine_no == undefined ||
          machine_no == ""
        ) {
          message.error(
            `Please, Enter valid details for Taka ${
              data.last_taka_no + fieldNumber
            }`
          );
          hasError = 1;
          return;
        }
      });

      if (hasError == 0) {
        const payload = {
          order_id: data.order_id,
          machine_name: data.machine_name,
          createdAt: dayjs(data.date).format("YYYY-MM-DD"),
          production_details: array.map((fieldNumber) => {
            return {
              taka_no: data.last_taka_no + fieldNumber,
              meter: +data[`meter_${fieldNumber}`],
              weight: +data[`weight_${fieldNumber}`],
              machine_no: data[`machine_no_${fieldNumber}`],
            };
          }),
        };

        await addNewOpeningProduction(payload);
      }
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
    setFocus,
    getValues,
    trigger,
  } = useForm({
    defaultValues: {
      is_create_challan: false,
      // year_type: "current",
      challan_no: "",
      challan_date: dayjs(),
      gst_state: "",
      gst_in: "",
      customer_gst_state: "",
      customer_gst_in: "",
      delivery_address: "",
      order_id: null,
      broker_name: "",
      broker_id: null,
      vehicle_id: null,
      party_id: null,
      company: null,

      // pending_meter: "",
      // pending_taka: "",
      // pending_weight: "",

      date: dayjs(),
      // this fields are in both form
      last_taka_no: "",
      last_taka_no_date: dayjs(),
      machine_name: null,
      quality_id: null,
    },
  });

  const {
    is_create_challan,
    last_taka_no,
    order_id,
    // pending_meter,
    // pending_taka,
    // pending_weight,
    broker_id,
    machine_name,
    party_id,
    quality_id,
  } = watch();

  // Fetch last production taka number fetch
  const { data: productionLastTaka } = useQuery({
    queryKey: [
      "last",
      "opening",
      "production",
      "taka",
      { company_id: companyId },
    ],
    queryFn: async () => {
      const res = await getLastProductionTakaRequest({
        companyId,
        params: { company_id: companyId },
      });
      return res?.data?.data;
      // return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  useEffect(() => {
    if (productionLastTaka !== null && productionLastTaka !== undefined) {
      setValue(
        "last_taka_no",
        productionLastTaka ? +productionLastTaka?.taka_no : 0
      );
      setValue("last_taka_no_date", dayjs(productionLastTaka?.createdAt));
    }
  }, [is_create_challan, productionLastTaka]);

  // Fetch party related dropdown list
  const { data: partyUserListRes, isLoading: isLoadingPartyList } = useQuery({
    queryKey: ["party", "list", { company_id: companyId, broker_id }],
    queryFn: async () => {
      if (broker_id) {
        const res = await getPartyListRequest({
          params: { company_id: companyId, broker_id },
        });
        return res.data?.data;
      }
    },
    enabled: Boolean(companyId),
  });

  const partyCompanyOption = useMemo(() => {
    if (party_id && partyUserListRes) {
      const selectedParty = partyUserListRes?.partyList?.rows?.find(
        ({ id }) => id === party_id
      );
      return [
        {
          label: selectedParty.party.company_name,
          value: selectedParty.party.user_id,
        },
      ];
    }
  }, [partyUserListRes, party_id]);

  // Gery order dropdown list
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

  // Get Inhouse quality dropdown list
  const { data: allQualityListRes, isLoading: allQualityLoading } = useQuery({
    queryKey: [
      "allQualityListRes",
      "list",
      {
        company_id: companyId,
        // machine_name: machine_name,
        page: 0,
        pageSize: 99999,
        is_active: 1,
      },
    ],
    queryFn: async () => {
      const res = await getInHouseQualityListRequest({
        params: {
          company_id: companyId,
          page: 0,
          pageSize: 99999,
          is_active: 1,
        },
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
          machine_name: machine_name,
          page: 0,
          pageSize: 99999,
          is_active: 1,
        },
      ],
      queryFn: async () => {
        if (machine_name) {
          const res = await getInHouseQualityListRequest({
            params: {
              company_id: companyId,
              machine_name: machine_name,
              page: 0,
              pageSize: 99999,
              is_active: 1,
            },
          });
          return res.data?.data;
        } else {
          return { row: [] };
        }
      },
      enabled: Boolean(companyId),
    });

  // Get Vehicle dropdown list
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

  // Get machinedropdown list
  const { data: machineListRes, isLoading: isLoadingMachineList } = useQuery({
    queryKey: ["machine", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getCompanyMachineListRequest({
        companyId,
        params: { company_id: companyId },
      });
      return res.data?.data?.machineList;
    },
    enabled: Boolean(companyId),
  });

  useEffect(() => {
    if (grayOrderListRes && order_id) {
      const order = grayOrderListRes.row.find(({ id }) => order_id === id);

      setPendingMeter(+order.pending_meter - +totalMeter);
      setPendingTaka(+order.pending_taka - +totalTaka);
      setPendingWeight(+order.pending_weight - +totalWeight);
    }
  }, [grayOrderListRes, order_id, totalMeter, totalTaka, totalWeight]);

  useEffect(() => {
    if (order_id && grayOrderListRes) {
      const order = grayOrderListRes.row.find(({ id }) => order_id === id);

      setValue("quality_id", order.quality_id);
      setValue(
        "broker_name",
        `${order.broker.first_name} ${order.broker.last_name}`
      );
      setValue("delivery_address", order.party.address);
      setValue("broker_id", order.broker_id);
      setValue("total_meter", order.total_meter);
      setValue("total_taka", order.total_taka);
      setValue("total_weight", order.weight);
      setValue("machine_name", order.machine_name);
      setValue("customer_gst_in", order?.party?.gst_no);

      setValue("party_id", order.party.id);
      setValue("company", order.party.id);
      // setValue("pending_meter", order.pending_meter);
      // setValue("pending_taka", order.pending_taka);
      // setValue("pending_weight", order.pending_weight);

      trigger("quality_id");
      trigger("broker_name");
      trigger("delivery_address");
      trigger("broker_id");
      trigger("total_meter");
      trigger("total_taka");
      trigger("total_weight");
      trigger("machine_name");
      trigger("party_id");
      trigger("company");
      trigger("pending_meter");
      trigger("pending_taka");
      trigger("pending_weight");
    }
  }, [order_id, grayOrderListRes, setValue, trigger]);

  useEffect(() => {
    if (company) {
      setValue("gst_in", company.gst_no);
    }
  }, [company, setValue, is_create_challan]);

  return (
    <Form
      form={form}
      layout="vertical"
      style={{ marginTop: "1rem" }}
      onFinish={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-2 p-4">
        <div
          className="flex items-center justify-between gap-5 mx-3 mb-3"
          style={{ marginTop: "-15px" }}
        >
          <div className="flex items-center gap-5">
            <Button onClick={() => navigate(-1)}>
              <ArrowLeftOutlined />
            </Button>
            <h3 className="m-0 text-primary">Add New Production</h3>
          </div>
          <div className="flex items-center gap-5">
            <Controller
              control={control}
              name="is_create_challan"
              render={({ field }) => (
                <Checkbox
                  {...field}
                  checked={field.value}
                  onChange={(e) => {
                    reset();
                    setTimeout(() => field.onChange(e.target.checked), 100);
                  }}
                >
                  Create Challan
                </Checkbox>
              )}
            />

            {/* <Controller
              control={control}
              name="year_type"
              render={({ field }) => (
                <Radio.Group {...field}>
                  <Flex align="center" gap={10}>
                    <Radio value={"current"}>Current Year</Radio>
                    <Radio value={"previous"}>Previous Year</Radio>
                  </Flex>
                </Radio.Group>
              )}
            /> */}
          </div>
        </div>

        {is_create_challan == true ? (
          <>
            <Row className="w-100" justify={"flex-start"} gutter={12}>
              <Col span={6}>
                <Form.Item
                  label="Challan No"
                  name={`challan_no`}
                  validateStatus={errors.challan_no ? "error" : ""}
                  help={errors.challan_no && errors.challan_no.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name={`challan_no`}
                    rules={{ required: "Challan No is required." }}
                    render={({ field }) => (
                      <Input {...field} placeholder="Challan no" />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Challan Date"
                  name={`challan_date`}
                  validateStatus={errors.challan_date ? "error" : ""}
                  help={errors.challan_date && errors.challan_date.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name={`challan_date`}
                    rules={{ required: "Challan date is required" }}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        style={{ width: "100%" }}
                        placeholder="Challan no"
                        disabledDate={disabledFutureDate}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row
              className="w-100"
              justify={"flex-start"}
              gutter={12}
              style={{ marginTop: "-15px" }}
            >
              <Col span={6}>
                <Form.Item
                  label="GST State"
                  name="gst_state"
                  validateStatus={errors.gst_state ? "error" : ""}
                  help={errors.gst_state && errors.gst_state.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name={`gst_state`}
                    rules={{ required: "GST State is required." }}
                    render={({ field }) => (
                      <Input {...field} placeholder="GST State" />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="GST IN"
                  name="gst_in"
                  validateStatus={errors.gst_in ? "error" : ""}
                  help={errors.gst_in && errors.gst_in.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name={"gst_in"}
                    rules={{ required: "GST IN is required." }}
                    render={({ field }) => (
                      <Input readOnly {...field} placeholder="GST in" />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Delivery Address"
                  name="delivery_address"
                  validateStatus={errors.delivery_address ? "error" : ""}
                  help={
                    errors.delivery_address && errors.delivery_address.message
                  }
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name={"delivery_address"}
                    rules={{ required: "Delivery address is required." }}
                    render={({ field }) => (
                      <Input {...field} placeholder="Delivery address" />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row
              className="w-100"
              justify={"flex-start"}
              gutter={12}
              style={{ marginTop: "-15px" }}
            >
              <Col span={6}>
                <Form.Item
                  label="Order no"
                  name="order_id"
                  validateStatus={errors.order_id ? "error" : ""}
                  help={errors.order_id && errors.order_id.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Flex gap={5}>
                    <Controller
                      control={control}
                      name="order_id"
                      rules={{ required: "Order is required." }}
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
                    <Button
                      type="primary"
                      onClick={() => navigate("/order-master/my-orders")}
                    >
                      <EyeOutlined />
                    </Button>
                  </Flex>
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
                    name={"broker_name"}
                    rules={{ required: "Broker is required." }}
                    render={({ field }) => (
                      <Input {...field} placeholder="Broker name" disabled />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Quality"
                  name="quality_id"
                  validateStatus={errors.quality_id ? "error" : ""}
                  help={errors.quality_id && errors.quality_id.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="quality_id"
                    rules={{ required: "Quality is required." }}
                    render={({ field }) => {
                      return (
                        <Select
                          {...field}
                          placeholder="Select Quality"
                          loading={allQualityLoading}
                          options={
                            allQualityListRes &&
                            allQualityListRes?.rows?.map((item) => ({
                              value: item.id,
                              label: item.quality_name,
                            }))
                          }
                          disabled
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
              className="w-100"
              justify={"flex-start"}
              gutter={12}
              style={{ marginTop: "-15px" }}
            >
              <Col span={6}>
                <Form.Item
                  label="Party"
                  name="party_id"
                  validateStatus={errors.party_id ? "error" : ""}
                  help={errors.party_id && errors.party_id.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="party_id"
                    rules={{ required: "Party is required." }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Select Party"
                        disabled
                        loading={isLoadingPartyList}
                        options={partyUserListRes?.partyList?.rows?.map(
                          (party) => ({
                            label:
                              party.first_name +
                              " " +
                              party.last_name +
                              " " +
                              `| ( ${party?.username})`,
                            value: party.id,
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
                  label="Company"
                  name="company"
                  validateStatus={errors.company ? "error" : ""}
                  help={errors.company && errors.company.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="company"
                    rules={{ required: "Company is required." }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Select Company"
                        options={partyCompanyOption}
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
              <Col span={4}>
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
                    rules={{ required: "Total meter is required." }}
                    name={"total_meter"}
                    render={({ field }) => (
                      <Input {...field} placeholder="0" disabled />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
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
                    rules={{ required: "Total weight is required." }}
                    name={"total_weight"}
                    render={({ field }) => (
                      <Input {...field} placeholder="0" disabled />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
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
                    name={"total_taka"}
                    rules={{ required: "Total taka is required." }}
                    render={({ field }) => (
                      <Input {...field} placeholder="0" disabled />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row
              className="w-100"
              justify={"flex-start"}
              style={{ alignItems: "center", marginTop: "-15px" }}
              gutter={12}
            >
              <Col span={6}>
                <Form.Item
                  label="GST State"
                  name="customer_gst_state"
                  validateStatus={errors.customer_gst_state ? "error" : ""}
                  help={
                    errors.customer_gst_state &&
                    errors.customer_gst_state.message
                  }
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name={`customer_gst_state`}
                    rules={{ required: "GST state is required." }}
                    render={({ field }) => (
                      <Input {...field} placeholder="GST State" />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="GST IN"
                  name="customer_gst_in"
                  validateStatus={errors.customer_gst_in ? "error" : ""}
                  help={
                    errors.customer_gst_in && errors.customer_gst_in.message
                  }
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name={"customer_gst_in"}
                    rules={{ required: "GST In is required." }}
                    render={({ field }) => (
                      <Input readOnly {...field} placeholder="GST in" />
                    )}
                  />
                </Form.Item>
              </Col>
              {/* All Pending information  */}
              <Col span={2} style={{ textAlign: "end", marginTop: "-25px" }}>
                <Typography.Text style={{ color: "red", fontWeight: 600 }}>
                  Pending
                </Typography.Text>
              </Col>

              <Col
                span={4}
                style={{
                  textAlign: "left",
                  marginTop: "-25px",
                  paddingLeft: "10px",
                }}
              >
                <Typography.Text style={{ color: "red" }}>
                  {pendingMeter || 0}
                </Typography.Text>
              </Col>

              <Col span={4} style={{ textAlign: "left", marginTop: "-25px" }}>
                <Typography.Text style={{ color: "red" }}>
                  {pendingWeight || 0}
                </Typography.Text>
              </Col>

              <Col span={4} style={{ textAlign: "left", marginTop: "-25px" }}>
                <Typography.Text style={{ color: "red" }}>
                  {pendingTaka || 0}
                </Typography.Text>
              </Col>
            </Row>
          </>
        ) : (
          <Row
            gutter={15}
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "-15px",
            }}
          >
            <Col span={8}>
              <Form.Item
                label="Machine"
                name="machine_name"
                validateStatus={errors.machine_name ? "error" : ""}
                help={errors.machine_name && errors.machine_name.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="machine_name"
                  rules={{ required: "Machine name is required." }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select Machine Name"
                      loading={isLoadingMachineList}
                      options={machineListRes?.rows?.map((machine) => ({
                        label: machine?.machine_name,
                        value: machine?.machine_name,
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

            <Col span={8}>
              <Form.Item
                label="Quality"
                name="quality_id"
                validateStatus={errors.quality_id ? "error" : ""}
                help={errors.quality_id && errors.quality_id.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="quality_id"
                  rules={{ required: "Quality is required." }}
                  render={({ field }) => {
                    return (
                      <>
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
                      </>
                    );
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Date"
                name="date"
                validateStatus={errors.date ? "error" : ""}
                help={errors.date && errors.date.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="date"
                  rules={{ required: "Date is required." }}
                  render={({ field }) => {
                    return (
                      <DatePicker
                        {...field}
                        className="w-100"
                        style={{ width: "100%" }}
                        disabledDate={disabledFutureDate}
                      />
                    );
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Divider style={{ marginTop: "-15px" }} />

        <Row
          gutter={15}
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "-15px",
          }}
        >
          <Col span={6}>
            <Form.Item
              label="Last Entered Taka No."
              name="last_taka_no"
              validateStatus={errors.enter_weight ? "error" : ""}
              help={errors.enter_weight && errors.enter_weight.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Flex align="center" gap={6}>
                <Controller
                  control={control}
                  name="last_taka_no"
                  render={({ field }) => (
                    <Input {...field} style={{ width: "30%" }} disabled />
                  )}
                />

                <Controller
                  control={control}
                  name="last_taka_no_date"
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      disabled
                      // style={{ width: "100%" }}
                    />
                  )}
                />
              </Flex>
            </Form.Item>
          </Col>

          <Col>
            <Flex gap={10} justify="flex-end">
              <Button htmlType="button" onClick={() => reset()}>
                Reset
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit(onSubmit)}
                loading={isPending}
              >
                Create
              </Button>
            </Flex>
          </Col>
        </Row>

        {quality_id != undefined && (
          <AddOpeningProductionTable
            errors={errors}
            control={control}
            setFocus={setFocus}
            activeField={activeField}
            setActiveField={setActiveField}
            setValue={setValue}
            lastOpeningProductionTaka={last_taka_no}
            getValues={getValues}
            totalMeter={totalMeter}
            setTotalMeter={setTotalMeter}
            totalWeight={totalWeight}
            setTotalWeight={setTotalWeight}
            totalTaka={totalTaka}
            setTotalTaka={setTotalTaka}
          />
        )}
      </div>
    </Form>
  );
};

export default OpenProduction;
