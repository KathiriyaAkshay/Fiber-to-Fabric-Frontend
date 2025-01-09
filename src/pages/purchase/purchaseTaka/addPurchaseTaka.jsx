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
import { Controller, set, useForm } from "react-hook-form";
import { useFetcher, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { getInHouseQualityListRequest } from "../../../api/requests/qualityMaster";
import { getDropdownSupplierListRequest } from "../../../api/requests/users";
import { getMyOrderListRequest } from "../../../api/requests/orderMaster";
import dayjs from "dayjs";
import FieldTable from "../../../components/fieldTable";
import {
  addPurchaseTakaRequest,
  checkUniqueTakaNoRequest,
} from "../../../api/requests/purchase/purchaseTaka";
import { disabledFutureDate } from "../../../utils/date";
import AlertModal from "../../../components/common/modal/alertModal";
import { PURCHASE_ORDER_TYPE, PURCHASE_QUALITY_TYPE, PURCHASE_SUPPLIER_TYPE } from "../../../constants/supplier";
import { getDisplayQualityName } from "../../../constants/nameHandler";
import { MY_ORDER_PENDING_STATUS } from "../../../constants/supplier";

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

const AddPurchaseTaka = () => {
  const queryClient = useQueryClient();

  const [isTakaExist, setIsTakaExist] = useState(false);

  const [totalTaka, setTotalTaka] = useState(0);
  const [totalMeter, setTotalMeter] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

  const [activeField, setActiveField] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [pendingMeter, setPendingMeter] = useState("");
  const [initialPendingMeter, setInitialPendingMeter] = useState(undefined) ; 

  const [pendingTaka, setPendingTaka] = useState("");
  const [initialPendingTaka, setInitialPendingTaka] = useState(undefined) ; 

  const [pendingWeight, setPendingWeight] = useState("");

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [tempOrderValue, setTempOrderValue] = useState(null);

  const navigate = useNavigate();
  //   const { data: user } = useCurrentUser();
  const { companyId, companyListRes } = useContext(GlobalContext);
  function goBack() {
    navigate(-1);
  }

  const { mutateAsync: AddPurchaseTaka, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await addPurchaseTakaRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["purchase", "taka", "add"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["purchaseTaka", "list", companyId]);
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
    
    const purchaseChallanDetailArr = Array.from(
      { length: activeField },
      (_, i) => i + 1
    );

    let hasError = 0;
    let all_taka_number = [];
    const purchase_challan_detail = [];

    purchaseChallanDetailArr.forEach((field) => {
      const takaNo = data[`taka_no_${field}`]; 
      const meter = data[`meter_${field}`];
      const weight = data[`weight_${field}`];

      if (
        (takaNo === "" || takaNo === undefined) &&
        (meter === "" || meter === undefined) &&
        (weight === "" || weight === undefined)
      ) {
        // If all three are empty or undefined, return early without generating errors.
        return;
      }
      
      // If any one of the fields has a value, validate each field individually.
      if (isNaN(takaNo) || takaNo === "" || takaNo === undefined) {
        message.error(`Enter taka no for ${field} number row.`);
        setError(`taka_no_${field}`, {
          type: "manual",
          message: "Taka No required.",
        });
        hasError = 1;
        return;
      }
      
      if (isNaN(meter) || meter === "" || meter === undefined) {
        message.error(`Enter meter for ${field} number row.`);
        setError(`meter_${field}`, {
          type: "manual",
          message: "Meter required.",
        });
        hasError = 1;
        return;
      }
      
      if (isNaN(weight) || weight === "" || weight === undefined) {
        message.error(`Enter weight for ${field} number row.`);
        setError(`weight_${field}`, {
          type: "manual",
          message: "Weight required.",
        });
        hasError = 1;
        return;
      }
      
      // If all three fields are valid, process the data.
      if (
        !isNaN(data[`taka_no_${field}`]) &&
        !isNaN(data[`meter_${field}`]) &&
        !isNaN(data[`weight_${field}`])
      ) {
        all_taka_number.push(data[`taka_no_${field}`]);
        purchase_challan_detail.push({
          taka_no: parseInt(data[`taka_no_${field}`]),
          meter: parseInt(data[`meter_${field}`]),
          weight: parseInt(data[`weight_${field}`]),
        });
      }
      
    });

    const newData = {
      delivery_address: data.delivery_address,
      gst_state: data.gst_state,
      gst_in: data.gst_in_2,
      challan_no: data.challan_no,
      gray_order_id: +data.gray_order_id,
      supplier_id: +data.supplier_id,
      broker_id: +data.broker_id,
      quality_id: +data.quality_id,
      total_meter: +totalMeter,
      total_weight: +totalWeight,
      total_taka: +totalTaka,
      pending_meter: +pendingMeter,
      pending_weight: +pendingWeight || 0,
      pending_taka: +pendingTaka,
      is_grey: true,
      purchase_challan_detail: purchase_challan_detail,
    };

    if (
      all_taka_number?.length !== [...new Set(all_taka_number)]?.length &&
      hasError == false
    ) {
      message.error("Please, Enter all unique taka");
      hasError = 1;
      return;
    }

    if (!hasError) {
      await AddPurchaseTaka(newData);
    }
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    setFocus,
    setError,
    clearErrors,
    getValues,
    resetField,
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
  const {
    supplier_name,
    gray_order_id,
    supplier_id,
  } = watch();

  // Dropdown quality list ========================
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
          production_type: PURCHASE_QUALITY_TYPE
        },
      ],
      queryFn: async () => {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
            page: 0,
            pageSize: 9999,
            is_active: 1,
            production_type: PURCHASE_QUALITY_TYPE
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });
  

  // My Order related dropdown api =============================
  const { data: grayOrderListRes, isLoading: isLoadingGrayOrderList } =
    useQuery({
      queryKey: [
        "party",
        "list",
        { company_id: companyId, order_type: PURCHASE_ORDER_TYPE, status: MY_ORDER_PENDING_STATUS},
      ],
      queryFn: async () => {
        const res = await getMyOrderListRequest({
          params: { company_id: companyId, order_type: PURCHASE_ORDER_TYPE, status: MY_ORDER_PENDING_STATUS },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });
  
  
  // Dropdown supplier list =================================================
  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: ["dropdown/supplier/list", { company_id: companyId, supplier_type: PURCHASE_SUPPLIER_TYPE }],
    queryFn: async () => {
      const res = await getDropdownSupplierListRequest({
        params: { company_id: companyId, supplier_type: PURCHASE_SUPPLIER_TYPE },
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
      if (order){
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
        setInitialPendingMeter(isNaN(order.pending_meter)?0:+order?.pending_meter || 0);
        setInitialPendingTaka(isNaN(order.pending_taka)?0:order.pending_taka || 0);
      }

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

  const orderChangeHandler = (field, selectedValue) => {
    setTempOrderValue(selectedValue);
    if (activeField >= 1) {
      if (
        getValues(`taka_no_1`) ||
        getValues(`meter_1`) ||
        getValues(`weight_1`)
      ) {
        setIsAlertOpen(true);
      } else {
        field.onChange(selectedValue);
      }
    } else {
      field.onChange(selectedValue);
    }
  };

  const onCancelHandler = () => {
    setIsAlertOpen(false);
  };

  const onConfirmHandler = () => {
    const purchaseChallanDetailArr = Array.from(
      { length: activeField },
      (_, i) => i + 1
    );

    purchaseChallanDetailArr.forEach((field) => {
      resetField(`taka_no_${field}`, "");
      resetField(`meter_${field}`, "");
      resetField(`weight_${field}`, "");
    });

    setValue("gray_order_id", tempOrderValue);
    setActiveField(1);
    setIsAlertOpen(false);

    setTotalTaka(0);
    setTotalMeter(0);
    setTotalWeight(0);
  };

  useEffect(() => {
    if (initialPendingMeter !== undefined) {
      setPendingMeter(+initialPendingMeter - totalMeter);
      
    }
    if (initialPendingTaka !== undefined) {
      setPendingTaka(+initialPendingTaka - totalTaka);
    }
  }, [
    initialPendingMeter, 
    initialPendingTaka, 
    totalTaka,
    totalMeter,
  ]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">
          Create Purchase Challan | GST No: {getValues("gst_in_1")}
        </h3>
      </div>
      <Form layout="vertical">
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
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
                    disabledDate={disabledFutureDate}
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
            padding: "0px 12px",
            marginTop: -20,
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

          {/* <Col span={6}>
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
          </Col> */}

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
                    onChange={(selectedValue) => {
                      orderChangeHandler(field, selectedValue);
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row
          gutter={18}
          style={{
            padding: "0px 12px",
          }}
        >
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
                          label: getDisplayQualityName(item),
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
        </Row>

        <Row
          gutter={18}
          style={{
            padding: "0px 12px",
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
        
        {/* Show Pending taka and Pending meter related information  */}
        <Row
          gutter={18}
          style={{
            padding: "0px 12px",
            marginTop: -10,
          }}
        >
          <Col span={3} style={{ textAlign: "center" }}>
            <div style={{textAlign: "left", fontSize: 12}}>Pending Meter</div>
            <Typography style={{ color: "red", textAlign: "left", fontWeight: 600 }}>
              {pendingMeter || 0}
            </Typography>
          </Col>

          <Col span={3} style={{ textAlign: "center" }}>
            <div style={{textAlign: "left", fontSize: 12}}>Pending Taka</div>
            <Typography style={{ color: "red", textAlign: "left", fontWeight: 600 }}>{pendingTaka || 0}</Typography>
          </Col>
        </Row>

        <Divider style={{ marginTop: 0 }} />

        {/* Purchase taka information table  */}
        <FieldTable
          errors={errors}
          control={control}
          setFocus={setFocus}
          setValue={setValue}
          activeField={activeField}
          setActiveField={setActiveField}
          checkUniqueTaka={true}
          checkUniqueTakaHandler={checkUniqueTakaHandler}
          isTakaExist={isTakaExist}
          setTotalMeter={setTotalMeter}
          setTotalWeight={setTotalWeight}
          setTotalTaka={setTotalTaka}
          getValues={getValues}
          clearErrors={clearErrors}
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
            htmlType="button"
            onClick={handleSubmit(onSubmit)}
            loading={isPending}
            disabled={isTakaExist}
          >
            Create
          </Button>
        </Flex>
      </Form>

      {isAlertOpen && (
        <AlertModal
          key={"alert_modal"}
          open={isAlertOpen}
          content="Are you sure you want to change? You will lose your entries!"
          onCancel={onCancelHandler}
          onConfirm={onConfirmHandler}
        />
      )}
    </div>
  );
};

export default AddPurchaseTaka;
