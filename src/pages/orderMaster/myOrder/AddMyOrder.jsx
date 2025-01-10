import {
  ArrowLeftOutlined,
  CloseOutlined,
  EyeOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
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
import { GlobalContext } from "../../../contexts/GlobalContext";
import { getInHouseQualityListRequest } from "../../../api/requests/qualityMaster";
import { getCompanyMachineListRequest } from "../../../api/requests/machine";
import {
  getBrokerListRequest,
  getDropdownSupplierListRequest,
  getPartyListRequest,
} from "../../../api/requests/users";
// import { useCurrentUser } from "../../../api/hooks/auth";
import dayjs from "dayjs";
import {
  createMyOrderRequest,
  getMyOrderQualityMeterRequest,
} from "../../../api/requests/orderMaster";
import { disableBeforeDate } from "../../../utils/date";
import { JOB_QUALITY_TYPE, PURCHASE_QUALITY_TYPE, TAKA_INHOUSE_QUALITY_TYPE } from "../../../constants/supplier";
import { getDisplayQualityName } from "../../../constants/nameHandler";

const ORDER_TYPE = [
  { label: "Taka(In House)", value: "taka(inhouse)" },
  { label: "Purchase/Trading", value: "purchase/trading" },
  { label: "Job", value: "job" },
];

const addYSCSchemaResolver = yupResolver(
  yup.object().shape({
    machine_name: yup.string().required("Please select machine."),
    quality_id: yup.string().required("Please select quality."),
    order_type: yup.string().required("Please select order type."),
    broker_id: yup.string().required("Please select broker."),
    notes: yup.string().required("Please, Enter order notes"),
    party_notes: yup.string().required("Please, Enter party notes"),
    weight: yup.string().required("Please, Enter weight"),
    total_lot: yup.string().required("Please, Enter total lot"),
    total_taka: yup.string().required("Please, Enter total taka"),
    total_meter: yup.string().required("Please, Enter total meter"),
    rate: yup.string().required("Please, Enter rate"),
    total_amount: yup.string().required("Please, Enter total amount"),
    credit_days: yup.string().required("Please, Enter credit days"),
    pending_taka: yup.string().required("Please, Enter pending taka"),
    pending_meter: yup.string().required("Please, Enter pending meter"),
  })
);

const AddMyOrder = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { companyId } = useContext(GlobalContext);
  function goBack() {
    navigate(-1);
  }

  const { mutateAsync: addMyOrder, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await createMyOrderRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["my-order", "add"],
    onSuccess: () => {
      queryClient.invalidateQueries(["myOrder", "list", companyId]);
      message.success("Gray order created successfully");
      navigate(-1);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  async function onSubmit(data) {
    
    if (data.order_type === "taka(inhouse)") {
      if (!data.party_id) {
        setError("party_id", {
          type: "manual",
          message: "Please select party.",
        });
        return;
      }
    }
    
    if (data.order_type === "job" || data.order_type === "purchase/trading") {
      if (!data.supplier_name) {
        setError("supplier_name", {
          type: "manual",
          message: "Please select supplier.",
        });
        return;
      }
    }

    if (parseFloat(data.pending_taka) < 0){
      message.warning("Please, Enter valid pending taka information") ; 
      return ; 
    }

    if (parseFloat(data.pending_meter) < 0){
      message.warning("Please, Enter valid pending meter information") ; 
      return ; 
    }

    const newData = {
      machine_name: data.machine_name,
      order_type: data.order_type,
      broker_id: parseInt(data.broker_id),
      quality_id: parseInt(data.quality_id),
      order_date: dayjs(data.order_date).format("YYYY-MM-DD"),
      notes: data.notes,
      party_notes: data.party_notes,
      order_count_in: data.order_count_in,
      weight: parseFloat(data.weight),
      total_taka: parseFloat(data.total_taka),
      rate: parseFloat(data.rate),
      total_amount: parseFloat(data.total_amount),
      total_lot: parseFloat(data.total_lot),
      total_meter: parseFloat(data.total_meter),
      amount: parseFloat(data.amount) || 0,
      credit_days: parseFloat(data.credit_days),
      delivered_taka: parseFloat(data.delivered_taka) || 0,
      delivered_meter: parseFloat(data.delivered_meter) || 0,
      pending_taka: parseFloat(data.pending_taka),
      pending_meter: parseFloat(data.pending_meter),
    };

    if (data.order_type === "taka(inhouse)") {
      newData.party_id = parseInt(data.party_id);
    }
    if (data.order_type === "job" || data.order_type === "purchase/trading") {
      newData.supplier_name = data.supplier_name;
    }
    await addMyOrder(newData);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    setError,
    getValues,
  } = useForm({
    defaultValues: {
      machine_name: null,
      order_type: "taka(inhouse)",
      broker_id: null,
      party_id: null,
      supplier_name: null,
      quality_id: null,

      order_date: dayjs(),
      notes: "",
      party_notes: "",
      order_count_in: "taka",
      weight: "",
      total_taka: "",
      rate: "",
      total_amount: "",
      total_lot: "",
      total_meter: "",
      amount: "",
      credit_days: "",
      delivered_taka: "",
      delivered_meter: "",
      pending_taka: "",
      pending_meter: "",
      remarks: "",
    },
    resolver: addYSCSchemaResolver,
  });
  const {
    machine_name,
    credit_days,
    order_type,
    order_count_in,
    party_id,
    quality_id,
  } = watch();

  useEffect(() => {
    if (credit_days) {
      setValue("remarks", `payment due in ${credit_days} days`);
      return;
    }
    setValue("remarks", "");
  }, [credit_days, setValue]);

  // ------------------------------------------------------------------------------------------

  // Dropdown quality list related api =============================================
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
          production_type: order_type
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
              production_type: order_type == "purchase/trading"?PURCHASE_QUALITY_TYPE:
                order_type == "job"?JOB_QUALITY_TYPE:TAKA_INHOUSE_QUALITY_TYPE``
            },
          });
          return res.data?.data;
        } else {
          return { row: [] };
        }
      },
      enabled: Boolean(companyId),
    });


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

  const { data: partyUserListRes, isLoading: isLoadingPartyList } = useQuery({
    queryKey: ["party", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getPartyListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const selectedPartyDetails = useMemo(() => {
    if (party_id && partyUserListRes) {
      const party = partyUserListRes.partyList.rows.find(
        ({ id }) => id === party_id
      );
      return [
        {
          label: "Party Name",
          value: `${party.first_name} ${party.last_name}`,
        },
        { label: "GST No", value: party.gst_no },
        { label: "Billing Address", value: party.address },
        { label: "Delivery Address", value: party.party.delivery_address },
      ];
    }
  }, [partyUserListRes, party_id]);

  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: ["dropdown/supplier/list", { company_id: companyId, supplier_type: order_type }],
    queryFn: async () => {
      if (order_type === "job" || order_type === "purchase/trading") {
        const res = await getDropdownSupplierListRequest({
          params: { company_id: companyId, type: order_type },
        });
        return res.data?.data?.supplierList;
      }
    },
    enabled: Boolean(companyId),
  });

  const goToAddBroker = () => {
    navigate("/user-master/my-broker/add");
  };

  const goToAddParty = () => {
    navigate("/user-master/my-party/add");
  };

  const goToAddQuality = () => {
    navigate("/quality-master/inhouse-quality/add");
  };

  const CalculateRate = () => {
    let rate = getValues("rate");
    let total_meter = getValues("total_meter");

    if (total_meter !== "" && total_meter !== undefined) {
      setValue("pending_meter", total_meter);
      if (rate !== "" && rate !== undefined) {
        let total_amount = Number(total_meter) * Number(rate);
        setValue("total_amount", total_amount);
      }
    }

    let total_taka = getValues("total_taka");
    if (total_taka !== undefined && total_taka !== "") {
      setValue("pending_taka", total_taka);
    }
  };

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Place new order</h3>
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
              label="Select Machine"
              name="machine_name"
              validateStatus={errors.machine_name ? "error" : ""}
              help={errors.machine_name && errors.machine_name.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="machine_name"
                render={({ field }) => (
                  <Select
                    {...field}
                    loading={isLoadingMachineList}
                    placeholder="Select Machine"
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

          <Col span={6}>
            <Form.Item
              label="Order Type"
              name="order_type"
              validateStatus={errors.order_type ? "error" : ""}
              help={errors.order_type && errors.order_type.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="order_type"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Order Type"
                    options={ORDER_TYPE}
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

          <Col span={6} className="flex items-end gap-2">
            <Form.Item
              label="Broker"
              name="broker_id"
              validateStatus={errors.broker_id ? "error" : ""}
              help={errors.broker_id && errors.broker_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
              className="flex-grow"
            >
              <Controller
                control={control}
                name="broker_id"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      style={{ width: "100%" }}
                      placeholder="Select Broker"
                      loading={isLoadingBrokerList}
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
                    />
                  );
                }}
              />
            </Form.Item>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={goToAddBroker}
              className="mb-6"
              type="primary"
            />
          </Col>

          {order_type === "taka(inhouse)" ? (
            <Col span={6} className="flex items-end gap-2">
              <Form.Item
                label="Party"
                name="party_id"
                validateStatus={errors.party_id ? "error" : ""}
                help={errors.party_id && errors.party_id.message}
                required={true}
                wrapperCol={{ sm: 24 }}
                className="flex-grow"
              >
                <Controller
                  control={control}
                  name="party_id"
                  render={({ field }) => {
                    return (
                      <Select
                        {...field}
                        placeholder="Select Party"
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
                      />
                    );
                  }}
                />
              </Form.Item>
              {party_id && (
                <PartyDetailModel
                  key={"view_party_details"}
                  title="Party Details"
                  details={selectedPartyDetails || {}}
                />
              )}
              <Button
                icon={<PlusCircleOutlined />}
                onClick={goToAddParty}
                className="mb-6"
                type="primary"
              />
            </Col>
          ) : (
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
          )}
        </Row>

        <Row
          gutter={18}
          style={{
            padding: "0px 12px",
          }}
        >
          <Col span={6} className="flex items-end gap-2">
            <Form.Item
              label="Select Quality"
              name="quality_id"
              validateStatus={errors.quality_id ? "error" : ""}
              help={errors.quality_id && errors.quality_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
              className="flex-grow"
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
                          label: getDisplayQualityName(item),
                        }))
                      }
                    />
                  );
                }}
              />
            </Form.Item>
            {quality_id && (
              <QualityDetailModel
                key={"quality_detail_modal"}
                qualityId={quality_id}
                companyId={companyId}
              />
            )}
            <Button
              icon={<PlusCircleOutlined />}
              onClick={goToAddQuality}
              className="mb-6"
              type="primary"
            />
          </Col>

          <Col span={6}>
            <Form.Item
              label="Date"
              name="order_date"
              validateStatus={errors.order_date ? "error" : ""}
              help={errors.order_date && errors.order_date.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="order_date"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    style={{ width: "100%" }}
                    disabledDate={disableBeforeDate}
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
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="notes"
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Party Notes"
              name="party_notes"
              validateStatus={errors.party_notes ? "error" : ""}
              help={errors.party_notes && errors.party_notes.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="party_notes"
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row
          gutter={18}
          style={{
            padding: "0px 12px",
            marginTop: "0.3rem",
          }}
        >
          <Col span={12}>
            <Card>
              <h3 className="m-0 text-primary">Order Data</h3>
              <Row
                gutter={18}
                style={{
                  paddingTop: "12px",
                }}
              >
                <Col span={12}>
                  <Form.Item
                    label=""
                    name="order_count_in"
                    validateStatus={errors.order_count_in ? "error" : ""}
                    help={
                      errors.order_count_in && errors.order_count_in.message
                    }
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="order_count_in"
                      render={({ field }) => {
                        return (
                          <Radio.Group
                            {...field}
                            onChange={(e) => {
                              setValue("order_count_in", e.target.value);
                            }}
                          >
                            <Radio value={"taka"}>Taka</Radio>
                            <Radio value={"meter"}>Meter</Radio>
                            <Radio value={"lot"}>Lot</Radio>
                          </Radio.Group>
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Flex justify="space-between">
                <Col span={6}>
                  <Form.Item
                    label="Weight"
                    name="weight"
                    validateStatus={errors.weight ? "error" : ""}
                    help={errors.weight && errors.weight.message}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="weight"
                      render={({ field }) => {
                        return (
                          <Input type="number" {...field} placeholder="12" />
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="Total Lot"
                    name="total_lot"
                    validateStatus={errors.total_lot ? "error" : ""}
                    help={errors.total_lot && errors.total_lot.message}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="total_lot"
                      render={({ field }) => {
                        return (
                          <Input
                            readOnly={order_count_in != "lot" ? true : false}
                            type="number"
                            {...field}
                            placeholder="12"
                            onChange={(e) => {
                              setValue("total_lot", e.target.value);

                              let total_lot = Number(e.target.value);

                              let total_taka = total_lot * Number(12);
                              setValue("total_taka", total_taka);
                              setValue("delivered_taka", 0);

                              let total_meter = Number(total_taka) * 110;
                              setValue("total_meter", total_meter);
                              setValue("delivered_meter", 0);

                              CalculateRate();
                            }}
                          />
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
              </Flex>
              <Flex justify="space-between">
                <Col span={6}>
                  <Form.Item
                    label="Total Taka"
                    name="total_taka"
                    validateStatus={errors.total_taka ? "error" : ""}
                    help={errors.total_taka && errors.total_taka.message}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="total_taka"
                      render={({ field }) => {
                        return (
                          <Input
                            type="number"
                            {...field}
                            readOnly={order_count_in == "taka" ? false : true}
                            placeholder="12"
                            onChange={(e) => {
                              setValue("total_taka", e.target.value);

                              let total_taka = Number(e.target.value);
                              let total_lot = total_taka / 12;
                              let total_meter = total_taka * Number(110);
                              setValue("total_lot", Math.round(total_lot));
                              setValue("delivered_taka", 0);
                              setValue("total_meter", total_meter);
                              setValue("delivered_meter", 0);

                              CalculateRate();
                            }}
                          />
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="Total Meter"
                    name="total_meter"
                    validateStatus={errors.total_meter ? "error" : ""}
                    help={errors.total_meter && errors.total_meter.message}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="total_meter"
                      render={({ field }) => {
                        return (
                          <Input
                            readOnly={order_count_in != "meter" ? true : false}
                            type="number"
                            {...field}
                            placeholder="12"
                            onChange={(e) => {
                              setValue("total_meter", e.target.value);
                              let total_meter = Number(e.target.value);

                              let total_taka = total_meter / 110;
                              setValue("total_taka", Math.round(total_taka));
                              setValue("delivered_taka", Math.round(0));

                              let total_lot = Number(total_taka) / 12;
                              setValue("total_lot", Math.round(total_lot));
                              setValue("delivered_meter", 0);

                              CalculateRate();
                            }}
                          />
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
              </Flex>
              <Flex justify="space-between">
                <Col span={6}>
                  <Form.Item
                    label="Rate"
                    name="rate"
                    validateStatus={errors.rate ? "error" : ""}
                    help={errors.rate && errors.rate.message}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="rate"
                      render={({ field }) => {
                        return (
                          <Input
                            type="number"
                            {...field}
                            placeholder="12"
                            onChange={(e) => {
                              let rate = e.target.value;
                              setValue("rate", e.target.value);

                              let total_meter = getValues("total_meter");
                              if (
                                total_meter !== "" &&
                                total_meter !== undefined
                              ) {
                                let total_amount =
                                  Number(total_meter) * Number(rate);
                                setValue("total_amount", total_amount);
                              }
                            }}
                          />
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
                {/* <Col span={6}>
                  <Form.Item
                    label="Final Rate"
                    name="amount"
                    validateStatus={errors.amount ? "error" : ""}
                    help={errors.amount && errors.amount.message}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="amount"
                      disabled
                      render={({ field }) => {
                        return (
                          <Input type="number" {...field} placeholder="12" />
                        );
                      }}
                    />
                  </Form.Item>
                </Col> */}
                <Col span={6}>
                  <Form.Item
                    label="Credit Days"
                    name="credit_days"
                    validateStatus={errors.credit_days ? "error" : ""}
                    help={errors.credit_days && errors.credit_days.message}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="credit_days"
                      render={({ field }) => {
                        return (
                          <Input type="number" {...field} placeholder="12" />
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
              </Flex>
              <Flex justify="space-between">
                <Col span={6}>
                  <Form.Item
                    label="Total Amount"
                    name="total_amount"
                    validateStatus={errors.total_amount ? "error" : ""}
                    help={errors.total_amount && errors.total_amount.message}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="total_amount"
                      render={({ field }) => {
                        return (
                          <Input
                            readOnly
                            type="number"
                            {...field}
                            placeholder="12"
                          />
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
              </Flex>
            </Card>
          </Col>

          <Col span={12}>
            <Card>
              <h3 className="m-0 text-primary">Current Status</h3>
              <Flex justify="space-between">
                <Col span={6}>
                  <Form.Item
                    label="Delivered Taka"
                    name="delivered_taka"
                    validateStatus={errors.delivered_taka ? "error" : ""}
                    help={
                      errors.delivered_taka && errors.delivered_taka.message
                    }
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="delivered_taka"
                      render={({ field }) => {
                        return (
                          <Input
                            readOnly={true}
                            type="number"
                            {...field}
                            placeholder="12"
                          />
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="Delivered Meter"
                    name="delivered_meter"
                    validateStatus={errors.delivered_meter ? "error" : ""}
                    help={
                      errors.delivered_meter && errors.delivered_meter.message
                    }
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="delivered_meter"
                      render={({ field }) => {
                        return (
                          <Input
                            readOnly
                            type="number"
                            {...field}
                            placeholder="12"
                          />
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
              </Flex>
              <Divider />

              <Flex justify="space-between">
                <Col span={6}>
                  <Form.Item
                    label="Pending Taka"
                    name="pending_taka"
                    validateStatus={errors.pending_taka ? "error" : ""}
                    help={errors.pending_taka && errors.pending_taka.message}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="pending_taka"
                      render={({ field }) => {
                        return (
                          <Input
                            type="number"
                            {...field}
                            placeholder="12"
                            onChange={(e) => {
                              let Pending_taka = e.target.value;
                              let total_taka = +getValues("total_taka");
                              if (Pending_taka > total_taka) {
                                setValue("pending_taka", 0);
                              } else {
                                setValue("pending_taka", Pending_taka);
                              }

                              if (
                                Pending_taka !== "" &&
                                Pending_taka !== undefined &&
                                total_taka !== "" &&
                                total_taka !== undefined
                              ) {
                                let delivered_taka = total_taka - +Pending_taka;
                                setValue("delivered_taka", delivered_taka);
                              }
                            }}
                          />
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="Pending Meter"
                    name="pending_meter"
                    validateStatus={errors.pending_meter ? "error" : ""}
                    help={errors.pending_meter && errors.pending_meter.message}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="pending_meter"
                      render={({ field }) => {
                        return (
                          <Input
                            type="number"
                            {...field}
                            placeholder="12"
                            onChange={(e) => {
                              let pending_meter = e.target.value;
                              let total_meter = +getValues("total_meter");

                              if (pending_meter > total_meter) {
                                setValue("pending_meter", 0);
                              } else {
                                setValue("pending_meter", pending_meter);
                              }
                              setValue("pending_meter", pending_meter);
                              if (
                                pending_meter !== "" &&
                                pending_meter !== undefined &&
                                total_meter !== "" &&
                                total_meter !== undefined
                              ) {
                                let delivered_meter =
                                  total_meter - +pending_meter;
                                setValue("delivered_meter", delivered_meter);
                              }
                            }}
                          />
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
              </Flex>
              <Flex>
                <Col span={24}>
                  <Form.Item
                    label="Remarks"
                    name="remarks"
                    validateStatus={errors.remarks ? "error" : ""}
                    help={errors.remarks && errors.remarks.message}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="remarks"
                      render={({ field }) => {
                        return <Input {...field} disabled />;
                      }}
                    />
                  </Form.Item>
                </Col>
              </Flex>
            </Card>
          </Col>
        </Row>

        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={() => reset()}>
            Reset
          </Button>
          {+getValues("total_taka") > +getValues("delivered_taka") &&
            +getValues("total_meter") > +getValues("delivered_meter") && (
              <Button type="primary" htmlType="submit" loading={isPending}>
                Create
              </Button>
            )}
        </Flex>
      </Form>
    </div>
  );
};

export default AddMyOrder;

const QualityDetailModel = ({ qualityId = null, companyId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: qualityDetails } = useQuery({
    queryKey: ["quality", "data", { company_id: companyId, qualityId }],
    queryFn: async () => {
      const res = await getMyOrderQualityMeterRequest({
        id: qualityId,
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });
  // [
  //       {
  //         label: "Inhouse Stock",
  //         value: "",
  //       },
  //       { label: "Purchase/Job Stock", value: "" },
  //       { label: "Next Production Meter", value: "" },
  //       { label: "Total", value: "" },
  //       { label: "(-) Total Scheduled Delivery", value: "" },
  //     ];

  return (
    <>
      <Button
        icon={<EyeOutlined />}
        onClick={() => setIsModalOpen(true)}
        className="mb-6"
        type="primary"
      />
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={null}
        open={isModalOpen}
        footer={null}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        centered={true}
        classNames={{
          header: "text-center",
        }}
        width={"60%"}
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
          },
        }}
      >
        <Row gutter={16} style={{ marginTop: 20, marginBottom: 20 }}>
          <Col span={24}>
            <Descriptions
              column={1}
              bordered
              className="grid-information-model"
            >
              {/* {details && details.length
                ? details?.map((element, index) => {
                    return (
                      <Descriptions.Item key={index} label={element?.label}>
                        {element?.value}
                      </Descriptions.Item>
                    );
                  })
                : null} */}

              <Descriptions.Item label={"Inhouse Stock"}>
                {qualityDetails?.production_meters}
              </Descriptions.Item>
              <Descriptions.Item label={"Next 7 Days Production"}>
                {qualityDetails?.next_week_production_meters}
              </Descriptions.Item>
              <Descriptions.Item label={"Job Stock"}>
                {qualityDetails?.job_meters}
              </Descriptions.Item>
              <Descriptions.Item label={"Purchase Stock"}>
                {qualityDetails?.purchase_meters}
              </Descriptions.Item>
              <Descriptions.Item label={"Total"}>
                {qualityDetails?.production_meters +
                  qualityDetails?.next_week_production_meters +
                  qualityDetails?.job_meters +
                  qualityDetails?.purchase_meters}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Modal>
    </>
  );
};

const PartyDetailModel = ({ details = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        icon={<EyeOutlined />}
        onClick={() => setIsModalOpen(true)}
        className="mb-6"
        type="primary"
      />
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Party Detail
          </Typography.Text>
        }
        open={isModalOpen}
        footer={() => {
          <Button type="primary" onClick={() => setIsModalOpen(false)}>
            OK
          </Button>;
        }}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        centered={true}
        classNames={{
          header: "text-center",
        }}
        width={"60%"}
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
          },
        }}
      >
        <Row gutter={16} style={{ marginTop: 20, marginBottom: 20 }}>
          <Col span={24}>
            <Descriptions
              column={1}
              bordered
              className="grid-information-model"
            >
              {details && details.length
                ? details?.map((element, index) => {
                    return (
                      <Descriptions.Item key={index} label={element?.label}>
                        {element?.value}
                      </Descriptions.Item>
                    );
                  })
                : null}
            </Descriptions>
          </Col>
        </Row>
      </Modal>
    </>
  );
};
