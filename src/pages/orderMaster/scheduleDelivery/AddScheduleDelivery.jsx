import { useContext, useEffect, useState } from "react";
import { ArrowLeftOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Tooltip,
  Typography,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { getPartyListRequest } from "../../../api/requests/users";
import {
  createScheduleDeliveryRequest,
  getMyOrderListRequest,
} from "../../../api/requests/orderMaster";
import { disableBeforeDate } from "../../../utils/date";
import dayjs from "dayjs";
import * as yup from "yup";

const validationSchema = yupResolver(
  yup.object().shape({
    party_id: yup.string().required("Please select party."),
    gray_order_id: yup.string().required("Please select order."),
    total_taka: yup.string().required("Please, Enter delivery taka"),
    total_meter: yup.string().required("Please, Enter delivery meter"),
    notes: yup.string().required("Please, Enter notes"),
    delivery_date: yup.string().required("Please, Enter delivery date"),
  })
);

const AddScheduleDelivery = () => {
  const navigate = useNavigate();
  const [enteredTaka, setEnteredTaka] = useState(0);
  const [enteredMeter, setEnteredMeter] = useState(0);

  const { companyId } = useContext(GlobalContext);
  // const [numOfFields, setNumOfFields] = useState([0]);

  function goBack() {
    navigate(-1);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    // reset,
    resetField,
    watch,
    setValue,
    setError,
  } = useForm({
    defaultValues: {
      gray_order_id: null,
      party_id: null,
      // order_id: null,
      quality_id: null,
      // pending_taka: "",
      // pending_meter: "",
      total_taka: "",
      total_meter: "",
      notes: "",
      delivery_date: dayjs(),
    },
    resolver: validationSchema,
    mode: "onChange",
  });

  const { mutateAsync: addScheduleDeliveryHandler, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await createScheduleDeliveryRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["schedule-delivery", "add"],
    onSuccess: (res) => {
      setEnteredTaka(res?.data?.scheduleDelivery?.total_taka || 0);
      setEnteredMeter(res?.data?.scheduleDelivery?.total_meter || 0);
      message.success(res.message);
      resetField("total_meter");
      resetField("total_taka");
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  // const addNewField = () => {
  //   const next = numOfFields[numOfFields.length - 1] + 1;
  //   setNumOfFields((prev) => [...prev, next]);
  // };

  // const removeField = (index) => {
  //   if (numOfFields.length > 1) {
  //     setNumOfFields((prev) => prev.filter((_, i) => i !== index));
  //   }
  // };

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Add Schedule Delivery</h3>
      </div>
      {/* <div className="flex items-center justify-end gap-5">
        <Button type="primary" loading={isPending} onClick={addNewField}>
          Add <PlusCircleOutlined />
        </Button>
      </div> */}

      {/* {numOfFields.map((_, index) => { */}
      {/* return ( */}
      <SingleScheduleEntry
        // key={index}
        companyId={companyId}
        // index={index}
        addScheduleDeliveryHandler={addScheduleDeliveryHandler}
        isPending={isPending}
        enteredTaka={enteredTaka}
        enteredMeter={enteredMeter}
        // grayOrderListRes={grayOrderListRes}
        // isLoadingGrayOrderList={isLoadingGrayOrderList}
        // partyUserListRes={partyUserListRes}
        // isLoadingPartyList={isLoadingPartyList}
        // removeField={removeField}
        setError={setError}
        watch={watch}
        setValue={setValue}
        control={control}
        errors={errors}
        resetField={resetField}
        handleSubmit={handleSubmit}
      />
      {/* ); */}
      {/* })} */}
    </div>
  );
};

export default AddScheduleDelivery;

const SingleScheduleEntry = ({
  companyId,
  addScheduleDeliveryHandler,
  isPending,
  enteredTaka,
  enteredMeter,
  // index,
  // grayOrderListRes,
  // isLoadingGrayOrderList,
  // partyUserListRes,
  // isLoadingPartyList,
  // removeField,
  setError,
  watch,
  setValue,
  control,
  errors,
  resetField,
  handleSubmit,
}) => {
  const [pendingMeter, setPendingMeter] = useState(0);
  const [pendingTaka, setPendingTaka] = useState(0);

  async function onSubmit(data) {
    const payload = {
      ...data,
      delivery_date: dayjs(data.delivery_date).format("YYYY-MM-DD"),
    };

    if (data.total_taka > pendingTaka) {
      // message.error("Deliver taka should not be greater than pending taka");
      setError("total_taka", {
        type: "manual",
        message: `should't be greater than ${pendingTaka}`,
      });
      return;
    }
    if (data.total_meter > pendingMeter) {
      // message.error(`Deliver meter should not be greater than ${pendingMeter}`);
      setError("total_meter", {
        type: "manual",
        message: `should't be greater than ${pendingMeter}`,
      });
      return;
    }

    await addScheduleDeliveryHandler(payload);
  }

  const { party_id, gray_order_id } = watch();

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

  const { data: grayOrderListRes, isLoading: isLoadingGrayOrderList } =
    useQuery({
      queryKey: [
        "gray-order",
        "list",
        { company_id: companyId, party_id, order_type: "job" },
      ],
      queryFn: async () => {
        const res = await getMyOrderListRequest({
          params: {
            company_id: companyId,
            party_id,
            order_type: "taka(inhouse)",
            end: dayjs().get("year"),
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId && party_id),
    });

  useEffect(() => {
    if (gray_order_id && grayOrderListRes) {
      const selectedOrder = grayOrderListRes.row.find(
        (order) => order.id === gray_order_id
      );
      if (selectedOrder) {
        // setValue("total_meter", selectedOrder.total_meter);
        // setValue("total_taka", selectedOrder.total_taka);
        // setValue("pending_taka", selectedOrder.pending_taka);
        // setValue("pending_meter", selectedOrder.pending_meter);
        // setValue("gray_order_id", selectedOrder.id);
        setValue("quality_id", selectedOrder.inhouse_quality.id);
        setPendingMeter(selectedOrder.pending_meter);
        setPendingTaka(selectedOrder.pending_taka);
      }
    }
  }, [gray_order_id, grayOrderListRes, setValue]);

  useEffect(() => {
    setPendingTaka((prev) => prev - enteredTaka);
    setPendingMeter((prev) => prev - enteredMeter);
  }, [enteredMeter, enteredTaka]);

  return (
    <Form layout="vertical">
      <Row
        gutter={18}
        style={{
          padding: "12px",
        }}
      >
        <Col span={4}>
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
                    onChange={(_, select) => {
                      field.onChange(select.value);
                      resetField("gray_order_id");
                    }}
                  />
                );
              }}
            />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item
            label="Select Order"
            name="gray_order_id"
            validateStatus={errors.gray_order_id ? "error" : ""}
            help={errors.gray_order_id && errors.gray_order_id.message}
            required={true}
            wrapperCol={{ sm: 24 }}
            className="flex-grow"
          >
            <Controller
              control={control}
              name="gray_order_id"
              render={({ field }) => {
                return (
                  <Select
                    {...field}
                    placeholder="Select Order"
                    loading={isLoadingGrayOrderList}
                    options={grayOrderListRes?.row?.map((order) => ({
                      label: order.order_no,
                      value: order.id,
                    }))}
                  />
                );
              }}
            />
          </Form.Item>
        </Col>

        {/*<Col span={4}>
          <Form.Item
            label="Pending Taka/Meter"
            name="pending_taka"
            validateStatus={errors.pending_taka ? "error" : ""}
            help={errors.pending_taka && errors.pending_taka.message}
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name="pending_taka"
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>
        </Col>

        <Col span={2}>
          <Form.Item
            label="Taka"
            name="total_taka"
            validateStatus={errors.total_taka ? "error" : ""}
            help={errors.total_taka && errors.total_taka.message}
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name="total_taka"
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>
        </Col>

        <Col span={2}>
          <Form.Item
            label="Meter"
            name="total_meter"
            validateStatus={errors.total_meter ? "error" : ""}
            help={errors.total_meter && errors.total_meter.message}
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name="total_meter"
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>
        </Col>*/}

        <Col span={4}>
          <Form.Item
            label={
              <>
                <Typography>Deliver Taka </Typography> &nbsp;&nbsp;&nbsp;
                {gray_order_id ? (
                  <Tooltip title={`Pending Taka: ${pendingTaka}`}>
                    <Typography.Text style={{ color: "green" }}>
                      PT: {pendingTaka}
                    </Typography.Text>
                  </Tooltip>
                ) : (
                  ""
                )}
              </>
            }
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
                <Input
                  {...field}
                  type="number"
                  placeholder="12"
                  onChange={(e) => {
                    field.onChange(+e.target.value);
                    if (+e.target.value > pendingTaka) {
                      setError("total_taka", {
                        type: "manual",
                        message: `should not be greater than ${pendingTaka}`,
                      });
                      return;
                    }
                  }}
                />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item
            label={
              <>
                <Typography>Deliver Meter </Typography> &nbsp;&nbsp;&nbsp;
                {gray_order_id ? (
                  <Tooltip title={`Pending Meter: ${pendingMeter}`}>
                    <Typography.Text style={{ color: "green" }}>
                      PM: {pendingMeter}
                    </Typography.Text>
                  </Tooltip>
                ) : (
                  ""
                )}
              </>
            }
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
                <Input
                  {...field}
                  type="number"
                  placeholder="12"
                  onChange={(e) => {
                    field.onChange(+e.target.value);
                    if (+e.target.value > pendingMeter) {
                      setError("total_meter", {
                        type: "manual",
                        message: `should not be greater than ${pendingMeter}`,
                      });
                      return;
                    }
                  }}
                />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={4}>
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
              render={({ field }) => <Input {...field} placeholder="Notes" />}
            />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item
            label="Date"
            name="delivery_date"
            validateStatus={errors.delivery_date ? "error" : ""}
            help={errors.delivery_date && errors.delivery_date.message}
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name="delivery_date"
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

        {/* <Col span={2.5} className="flex items-center gap-2">
          <Flex gap={10} justify="flex-end">
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleSubmit(onSubmit)}
              loading={isPending}
            />
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                reset();
                removeField(index);
              }}
            />
          </Flex>
        </Col> */}
      </Row>
      <Flex justify="end">
        <Button
          type="primary"
          onClick={handleSubmit(onSubmit)}
          loading={isPending}
          icon={<CheckCircleOutlined />}
        >
          Save
        </Button>
      </Flex>
    </Form>
  );
};
