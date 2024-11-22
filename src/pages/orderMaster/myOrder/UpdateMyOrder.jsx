import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  DatePicker,
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
import { getCompanyMachineListRequest } from "../../../api/requests/machine";
import {
  getBrokerListRequest,
  getDropdownSupplierListRequest,
  getPartyListRequest,
} from "../../../api/requests/users";
import dayjs from "dayjs";
import {
  getMyOrderByIdRequest,
  updateMyOrderRequest,
} from "../../../api/requests/orderMaster";

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
    party_id: yup.string().required("Please select party."),
    // gray_stock_meter: yup.string().required("Please enter meter."),
    // taka: yup.string().required("Please enter taka."),
    // yarn_stock_total_kg: yup
    //   .string()
    //   .required("Please enter yarn stock total kg."),
    // beam_stock: yup.string().required("Please enter beam stock."),
    // remark: yup.string().required("Please enter remark."),
  })
);

const UpdateMyOrder = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  // const { data: user } = useCurrentUser();
  const { companyId } = useContext(GlobalContext);
  function goBack() {
    navigate(-1);
  }

  const { mutateAsync: updateMyOrder } = useMutation({
    mutationFn: async (data) => {
      const res = await updateMyOrderRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["myOrder", "update", id],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["myOrder", "list", companyId]);
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

    const newData = {
      machine_name: data.machine_name,
      order_type: data.order_type,
      broker_id: parseInt(data.broker_id),
      party_id: parseInt(data.party_id),
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
      amount: parseFloat(data.amount),
      credit_days: parseFloat(data.credit_days),
      delivered_taka: parseFloat(data.delivered_taka),
      delivered_meter: parseFloat(data.delivered_meter),
      pending_taka: parseFloat(data.pending_taka),
      pending_meter: parseFloat(data.pending_meter),
    };

    if (data.order_type === "taka(inhouse)") {
      newData.party_id = parseInt(data.party_id);
    }
    if (data.order_type === "job" || data.order_type === "purchase/trading") {
      newData.supplier_name = data.supplier_name;
    }
    await updateMyOrder(newData);
  }

  const [is_order_used, set_is_order_used] = useState(false) ; 
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    setError,
  } = useForm({
    defaultValues: {
      machine_name: null,
      order_type: "",
      broker_id: null,
      party_id: null,
      quality_id: null,

      order_date: dayjs(),
      notes: "",
      party_notes: "",
      order_count_in: "meter",
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

  const {order_count_in} = watch();
  const { machine_name, credit_days, order_type } = watch();
  useEffect(() => {
    if (credit_days) {
      setValue("remarks", `payment due in ${credit_days} days`);
      return;
    }
    setValue("remarks", "");
  }, [credit_days, setValue]);

  const { data: orderDetails } = useQuery({
    queryKey: ["myOrder", "get", id, { company_id: companyId }],
    queryFn: async () => {
      const res = await getMyOrderByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  // ------------------------------------------------------------------------------------------

  const { data: dropDownQualityListRes, dropDownQualityLoading } = useQuery({
    queryKey: [
      "dropDownQualityListRes",
      "list",
      {
        company_id: companyId,
        machine_name: machine_name,
        page: 0,
        pageSize: 9999,
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
            pageSize: 9999,
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

  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: ["dropdown/supplier/list", { company_id: companyId, order_type }],
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

  useEffect(() => {
    if (orderDetails) {
      const {
        machine_name,
        broker_id,
        party_id,
        quality_id,
        notes,
        party_notes,
        order_date,
        order_type,
        supplier_name,
        weight,
        total_taka,
        rate,
        total_amount,
        total_lot,
        total_meter,
        amount,
        credit_days,
        delivered_meter,
        delivered_taka,
        pending_meter,
        pending_taka,
        order_count_in
      } = orderDetails.order;
      reset({
        machine_name,
        broker_id,
        party_id,
        quality_id,
        notes,
        party_notes,
        order_date: dayjs(order_date),
        order_type,
        supplier_name,
        weight,
        total_taka,
        rate,
        total_amount,
        total_lot,
        total_meter,
        amount,
        credit_days,
        delivered_meter,
        delivered_taka,
        pending_meter,
        pending_taka,
        remarks: `payment due in ${credit_days} days`,
        order_count_in: order_count_in
      });
      set_is_order_used( orderDetails?.is_order_used)
    }
  }, [orderDetails, reset]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Edit order</h3>
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
                    disabled
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
                    disabled
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

          <Col span={6}>
            <Form.Item
              label="Broker"
              name="broker_id"
              validateStatus={errors.broker_id ? "error" : ""}
              help={errors.broker_id && errors.broker_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="broker_id"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      disabled
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
          </Col>

          {order_type === "taka(inhouse)" ? (
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
                  render={({ field }) => {
                    return (
                      <Select
                        {...field}
                        disabled
                        placeholder="Select Supervisor"
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
                      disabled
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
            padding: "12px",
          }}
        >
          <Col span={6}>
            <Form.Item
              label="Select Quality"
              name="quality_id"
              validateStatus={errors.quality_id ? "error" : ""}
              help={errors.quality_id && errors.quality_id.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="quality_id"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      disabled
                      placeholder="Select Quality"
                      loading={dropDownQualityLoading}
                      // onChange={(newValue) => {
                      //   field.onChange(newValue?.value);
                      // }}
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
                  <DatePicker {...field} style={{ width: "100%" }} disabled />
                )}
              />
            </Form.Item>
          </Col>

          {/* <Col span={2}>
            <Form.Item
              label="Order No"
              name="order_no"
              validateStatus={errors.order_no ? "error" : ""}
              help={errors.order_no && errors.order_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="order_no"
                render={({ field }) => <Input {...field} placeholder="12" />}
              />
            </Form.Item>
          </Col> */}

          <Col span={5}>
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

          <Col span={5}>
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
            padding: "12px",
            marginTop: -10
          }}
        >
          <Col span={12}>
            <Card>
              <h3 className="m-0 text-primary">Order Data</h3>
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
                          <Input 
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
                            type="number" 
                            {...field} 
                            placeholder="12" 
                            readOnly={order_count_in != "lot" ?true:is_order_used?true:false}
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
                            placeholder="12"
                            readOnly={order_count_in == "taka"? 
                              is_order_used?true:false:true}
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
                            type="number"
                            {...field}
                            placeholder="12"
                            readOnly={order_count_in != "meter" ?true :is_order_used?true:false}
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
                          <Input type="number" {...field} placeholder="12" />
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
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
                            type="number"
                            {...field}
                            placeholder="12"
                            disabled
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
                            type="number"
                            {...field}
                            placeholder="12"
                            disabled
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
                            type="number"
                            {...field}
                            placeholder="12"
                            disabled
                          />
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
              </Flex>

              <Divider style={{marginTop: 0}} />

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
                            disabled
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
                            disabled
                          />
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
              </Flex>

              {/* <Flex justify="space-between">
                <Col span={6}>
                  <Form.Item
                    label="Return Taka"
                    name="return_taka"
                    validateStatus={errors.return_taka ? "error" : ""}
                    help={errors.return_taka && errors.return_taka.message}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="return_taka"
                      render={({ field }) => {
                        return (
                          <Input
                            type="number"
                            {...field}
                            placeholder="12"
                            disabled
                          />
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="Return Meter"
                    name="return_meter"
                    validateStatus={errors.return_meter ? "error" : ""}
                    help={errors.return_meter && errors.return_meter.message}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="return_meter"
                      render={({ field }) => {
                        return (
                          <Input
                            type="number"
                            {...field}
                            placeholder="12"
                            disabled
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
                        return <Input {...field} />;
                      }}
                    />
                  </Form.Item>
                </Col>
              </Flex> */}
            </Card>
          </Col>
        </Row>

        <Flex gap={10} justify="flex-end">
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Flex>
      </Form>
    </div>
  );
};

export default UpdateMyOrder;
