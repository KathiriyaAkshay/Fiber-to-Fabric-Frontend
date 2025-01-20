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
import { getVehicleUserListRequest } from "../../../../api/requests/users";
import { getMyOrderListRequest } from "../../../../api/requests/orderMaster";
import dayjs from "dayjs";
import { createSaleChallanRequest } from "../../../../api/requests/sale/challan/challan";
import SaleChallanFieldTable from "../../../../components/sale/challan/saleChallan/SaleChallanFieldTable";
import AlertModal from "../../../../components/common/modal/alertModal";
import { disabledFutureDate } from "../../../../utils/date";
import { getPurchaseTakaByIdRequest } from "../../../../api/requests/purchase/purchaseTaka";
import { getJobTakaByIdRequest } from "../../../../api/requests/job/jobTaka";
import { MY_ORDER_PENDING_STATUS } from "../../../../constants/supplier";
import { TAKA_IN_HOUSE_ORDER_TYPE } from "../../../../constants/supplier";
import { getDisplayQualityName } from "../../../../constants/nameHandler";
import { getPartyListRequest } from "../../../../api/requests/users";

const addJobTakaSchemaResolver = yupResolver(
  yup.object().shape({
    delivery_address: yup.string().required("Please enter delivery address."),
    gst_state: yup.string().required("Please enter GST State."),
    gst_state_2: yup.string().required("Please enter GST State."),
    gst_in_1: yup.string().required("Please enter GST In."),
    gst_in_2: yup.string().required("Please enter GST In."),
    challan_no: yup.string().required("Please enter challan no."),
    gray_order_id: yup.string().required("Please select order."),
    party_id: yup.string().required("Please select party."),
    party_name: yup.string().required("Please, Select party name"),
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // const [fieldArray, setFieldArray] = useState([0]);
  const SALE_CHALLAN_ADD = JSON.parse(localStorage.getItem("SALE_CHALLAN_ADD"));
  const [saleChallanTypes, setSaleChallanTypes] = useState([]);

  const [totalTaka, setTotalTaka] = useState(0);
  const [totalMeter, setTotalMeter] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

  const [activeField, setActiveField] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Calculation pending data related information ====================

  const [initialPendingMeter, setInitialPendingMeter] = useState(undefined);
  const [pendingMeter, setPendingMeter] = useState(0);

  const [initialPendingTaka, setInitialPendingTaka] = useState(undefined);
  const [pendingTaka, setPendingTaka] = useState(0);

  const [pendingWeight, setPendingWeight] = useState(0);
  const { companyId, companyListRes } = useContext(GlobalContext);

  const [isPartySelect, setIsPartySelect] = useState(false) ; 

  function goBack() {
    navigate(-1);
  }

  // Add sale challan request handler
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
    // Sale Challan details array
    const saleChallanDetailArr = Array.from(
      { length: activeField },
      (_, i) => i + 1
    );

    const sale_challan_detail = [];
    let hasError = 0;

    // Purchase taka details
    let purchased_taka_number = [];

    // Job taka details
    let job_taka_number = [];

    // Sale taka details
    let sale_taka_number = [];

    saleChallanDetailArr.forEach((field, index) => {
      const takaNo = data[`taka_no_${field}`];
      const meter = data[`meter_${field}`];
      const weight = data[`weight_${field}`];

      // Check if all fields are null, undefined, empty, or NaN
      const areAllFieldsEmpty =
        (takaNo === null ||
          takaNo === undefined ||
          takaNo === "" ||
          isNaN(takaNo)) &&
        (meter === null ||
          meter === undefined ||
          meter === "" ||
          isNaN(meter)) &&
        (weight === null ||
          weight === undefined ||
          weight === "" ||
          isNaN(weight));

      if (areAllFieldsEmpty) {
        // Skip this iteration if all fields are empty
        return;
      }

      if ((isNaN(takaNo) || takaNo === "") && meter !== "" && weight !== "") {
        message.error(`Enter taka no for ${field} number row.`);
        setError(`taka_no_${field}`, {
          type: "manual",
          message: "Taka No required.",
        });
        hasError = 1;
        return;
      }
      if ((isNaN(meter) || meter === "") && takaNo !== "" && weight !== "") {
        message.error(`Enter meter for ${field} number row.`);
        setError(`meter_${field}`, {
          type: "manual",
          message: "Meter required.",
        });
        hasError = 1;
        return;
      }
      if ((isNaN(weight) || weight === "") && meter !== "" && takaNo !== "") {
        message.error(`Enter weight for ${field} number row.`);
        setError(`weight_${field}`, {
          type: "manual",
          message: "Weight required.",
        });
        hasError = 1;
        return;
      }

      if (takaNo !== "" && meter !== "" && weight !== "") {
        let model = data[`model_${field}`];
        let taka_number = takaNo;

        if (model === "purchase/trading") {
          purchased_taka_number.push(taka_number);
        } else if (model === "taka(inhouse)") {
          sale_taka_number.push(taka_number);
        } else {
          job_taka_number.push(taka_number);
        }

        sale_challan_detail.push({
          index: index + 1,
          taka_no: taka_number,
          meter: parseInt(meter),
          weight: parseInt(weight),
          model: model,
        });
      }
    });

    if (sale_challan_detail?.length == 0) {
      message.error("Required at least one taka");
    } else {
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
        // supplier_id: +data.supplier_id,
        delivery_note: data.delivery_note,

        pending_meter: +pendingMeter,
        pending_weight: +pendingWeight || 0,
        pending_taka: +pendingTaka,

        total_taka: +totalTaka,
        total_meter: +totalMeter,
        total_weight: +totalWeight,

        sale_challan_types: saleChallanTypes.map((type) => {
          return {
            sale_challan_type: type,
          };
        }),
        sale_challan_details: sale_challan_detail,
      };

      if (
        purchased_taka_number?.length !==
        [...new Set(purchased_taka_number)]?.length
      ) {
        message.error(
          "Please provide a unique taka number of PURCHASE to proceed with the sale"
        );
        hasError = true;
        return;
      }

      if (sale_taka_number?.length !== [...new Set(sale_taka_number)]?.length) {
        message.error(
          "Please provide a unique taka number of SALE to proceed with the sale"
        );
        hasError = true;
        return;
      }

      if (job_taka_number?.length !== [...new Set(job_taka_number)]?.length) {
        message.error(
          "Please provide a unique taka number of JOB to proceed with the sale"
        );
        hasError = true;
        return;
      }

      if (hasError === 0) {
        await AddSaleChallan(newData);
      }
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
    resetField,
    getValues,
    setError,
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
  const { gray_order_id, type, is_gray, quality_id, party_name, party_id } =
    watch();

  // Vehicle dropdown list ===========================================================
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

  // DropDown quality list ===========================================
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

  // Greyorder dropdown list api =====================================================
  const { data: grayOrderListRes, isLoading: isLoadingGrayOrderList } =
    useQuery({
      queryKey: ["myorder", "list", { company_id: companyId }],
      queryFn: async () => {
        const params = {
          company_id: companyId,
          status: MY_ORDER_PENDING_STATUS,
          order_type: TAKA_IN_HOUSE_ORDER_TYPE,
        };

        const res = await getMyOrderListRequest({
          params,
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  // Dropdown party list api =======================================================
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

  const dropdownPartyCompanyOption = useMemo(() => {
    if (
      party_name &&
      partyUserListRes &&
      partyUserListRes?.partyList?.rows.length
    ) {
      resetField("party_id");

      let party_company = [];

      const obj = partyUserListRes?.partyList?.rows.find((item) => {
        return +item.id === +party_name;
      });

      party_company.push({
        label: obj?.party?.company_name,
        value: obj?.party?.user_id,
        party: obj?.party,
      });

      if (obj) {
        obj?.sub_parties?.map((element) => {
          party_company.push({
            label: element?.party?.company_name,
            value: element?.party?.user_id,
            party: element?.party,
          });
        });
      }

      return party_company;
    } else {
      return [];
    }
  }, [party_name, partyUserListRes, resetField]);

  useEffect(() => {
    if (grayOrderListRes && grayOrderListRes?.row?.length && gray_order_id) {
      const order = grayOrderListRes?.row?.find(
        ({ id }) => gray_order_id === id
      );
      if (order) {
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
        setValue("delivery_address", order?.party?.party?.delivery_address);
        setValue("party_name", order?.party?.id);
      }
    } else {
      console.log("Not match any order information ");
      setIsPartySelect(true) ; 
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
    if (party_id) {
      const selectedPartyCompany = dropdownPartyCompanyOption.find(
        (item) => item.value === +party_id
      );
      setValue("gst_in_2", selectedPartyCompany?.party?.company_gst_number);
      setValue(
        "delivery_address",
        selectedPartyCompany?.party?.delivery_address
      );
    }
  }, [party_id, dropdownPartyCompanyOption, setValue]);

  useEffect(() => {
    if (grayOrderListRes && grayOrderListRes?.row?.length && gray_order_id) {
      const order = grayOrderListRes?.row?.find(
        ({ id }) => gray_order_id === id
      );

      if (order) {
        setInitialPendingMeter(+order?.pending_meter || 0);
        setInitialPendingTaka(+order?.pending_taka || 0);
      }
    }
  }, [grayOrderListRes, gray_order_id, totalMeter, totalTaka, totalWeight]);

  // *******************************************************************

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [tempOrderValue, setTempOrderValue] = useState(null);

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

  // *******************************************************************
  // Code for sale challan from job or purchase.

  useEffect(() => {
    if (SALE_CHALLAN_ADD) {
      if (SALE_CHALLAN_ADD.model === "taka(inhouse)") {
        setValue("gray_order_id", SALE_CHALLAN_ADD.id);
      }
    }
  }, []);

  const { data: purchaseDetails } = useQuery({
    queryKey: [
      "purchaseDetail",
      "get",
      { company_id: companyId, purchaseId: SALE_CHALLAN_ADD?.id },
    ],
    queryFn: async () => {
      const res = await getPurchaseTakaByIdRequest({
        id: SALE_CHALLAN_ADD?.id,
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(
      companyId &&
        SALE_CHALLAN_ADD?.id &&
        SALE_CHALLAN_ADD?.model === "purchase"
    ),
  });

  useEffect(() => {
    if (purchaseDetails) {
      console.log({ purchaseDetails });
      const {
        // challan_no,
        // delivery_address,
        // gst_in,
        // gst_state,
        quality_id,
        // supplier_id,
        // total_meter,
        // total_taka,
        // total_weight,
        // supplier,
        // broker_id,
        // broker,
        // gray_order_id,
        // createdAt,
        purchase_challan_details,
      } = purchaseDetails;

      setActiveField(purchase_challan_details.length + 1);

      let purchaseChallanDetails = {};
      // let totalMeter = 0;
      // let totalWeight = 0;
      purchase_challan_details.forEach((item, index) => {
        purchaseChallanDetails[`taka_no_${index + 1}`] = item.taka_no;
        purchaseChallanDetails[`meter_${index + 1}`] = item.meter;
        purchaseChallanDetails[`weight_${index + 1}`] = item.weight;
        purchaseChallanDetails[`model_${index + 1}`] = "purchase/trading";
        // totalMeter += +item?.meter;
        // totalWeight += +item?.weight;
      });

      // setTotalTaka(purchase_challan_details.length);
      // setTotalMeter(totalMeter);
      // setTotalWeight(totalWeight);

      // setPendingMeter(+total_meter - totalMeter);
      // setPendingWeight(+total_weight - totalWeight);
      // setPendingTaka(+total_taka - purchase_challan_details?.length);

      reset({
        //   company_id,
        // challan_no,
        // delivery_address,
        // gst_in_1: gst_in,
        // // gst_in_2: gst_in,
        // gst_state: gst_state,
        quality_id,
        // broker_id: broker_id,
        // broker_name: `${broker.first_name} ${broker.last_name}`,
        // supplier_id,
        // gray_order_id,
        // total_meter,
        // total_taka,
        // total_weight,
        // supplier_name: supplier.supplier_name,
        // challan_date: dayjs(createdAt),
        type: ["purchase/trading"],
        ...purchaseChallanDetails,
      });
    }
  }, [purchaseDetails, reset]);

  const { data: jobTakaDetails } = useQuery({
    queryKey: [
      "yarnSentDetail",
      "get",
      { company_id: companyId, jobId: SALE_CHALLAN_ADD?.id },
    ],
    queryFn: async () => {
      const res = await getJobTakaByIdRequest({
        id: SALE_CHALLAN_ADD?.id,
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(
      companyId && SALE_CHALLAN_ADD?.id && SALE_CHALLAN_ADD?.model === "job"
    ),
  });

  useEffect(() => {
    if (jobTakaDetails) {
      const {
        // challan_no,
        // delivery_address,
        // gst_in,
        // gst_state,
        quality_id,
        // supplier_id,
        // gray_order_id,
        // total_meter,
        // total_taka,
        // total_weight,
        // is_grey,
        job_challan_details,
        // supplier,
        // createdAt,
        // broker_id,
        // broker,
      } = jobTakaDetails;

      setActiveField(job_challan_details.length + 1);
      let jobChallanDetails = {};
      // let totalMeter = 0;
      // let totalWeight = 0;
      job_challan_details.forEach((item, index) => {
        jobChallanDetails[`taka_no_${index + 1}`] = item.taka_no;
        jobChallanDetails[`meter_${index + 1}`] = item.meter;
        jobChallanDetails[`weight_${index + 1}`] = item.weight;
        jobChallanDetails[`model_${index + 1}`] = "job";
        // totalMeter += +item?.meter;
        // totalWeight += +item?.weight;
        setTotalTaka(job_challan_details.length);
      });
      // setTotalMeter(totalMeter);
      // setTotalWeight(totalWeight);
      // setPendingMeter(+total_meter - totalMeter);
      // setPendingWeight(+total_weight - totalWeight);
      // setPendingTaka(+total_taka - job_challan_details?.length);

      reset({
        // challan_no,
        // delivery_address,
        // gst_in_1: gst_in,
        // gst_in_2: gst_in,
        // gst_state,
        quality_id,
        // broker_id: broker_id,
        // broker_name: `${broker.first_name} ${broker.last_name}`,
        // supplier_id,
        // gray_order_id,
        // total_meter,
        // total_taka,
        // total_weight,
        // is_grey,
        // supplier_name: supplier.supplier_name,
        // challan_date: dayjs(createdAt),
        type: ["job"],
        ...jobChallanDetails,
      });
    }
  }, [jobTakaDetails, reset]);

  // ====== Pending meter and Pending taka option handler ============ //
  useEffect(() => {
    if (totalMeter !== undefined && initialPendingMeter !== undefined) {
      setPendingMeter(+initialPendingMeter - totalMeter);
    }

    if (totalTaka !== undefined && initialPendingTaka !== undefined) {
      setPendingTaka(+initialPendingTaka - totalTaka);
    }
  }, [initialPendingMeter, totalTaka, totalMeter, initialPendingTaka]);

  const handleBeforeUnload = () => {
    localStorage.removeItem("SALE_CHALLAN_ADD");
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div
      className="flex flex-col e-4"
      style={{
        overflowX: "hidden",
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingTop: 10,
      }}
    >
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
      <Row
        gutter={18}
        style={{
          paddingTop: "12px",
          marginTop: "-15px",
        }}
      >
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
                <Input
                  {...field}
                  placeholder="CH123456"
                  readOnly={is_gray == "false" ? true : false}
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
                  disabledDate={disabledFutureDate}
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row
        gutter={18}
        style={{
          marginTop: "-15px",
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

        <Col span={8}>
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
          marginTop: "-15px",
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
                  onChange={(selectedValue) =>
                    orderChangeHandler(field, selectedValue)
                  }
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
        style={{
          marginTop: "-15px",
        }}
      >
        <Col span={6}>
          <Form.Item
            label="Select Party"
            name="party_name"
            validateStatus={errors.party_name ? "error" : ""}
            help={errors.party_name && errors.party_name.message}
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name="party_name"
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select Party"
                  disabled={!isPartySelect}
                  loading={isLoadingPartyList}
                  options={partyUserListRes?.partyList?.rows?.map((party) => ({
                    label: `${party?.first_name} ${party?.last_name}`,
                    value: party?.id,
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
            name="party_id"
            validateStatus={errors.party_id ? "error" : ""}
            help={errors.party_id && errors.party_id.message}
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name="party_id"
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select Company"
                  options={dropdownPartyCompanyOption}
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
          style={{
            marginTop: "-15px",
            marginBottom: "10px",
          }}
        >
          <Col span={6}></Col>
          <Col span={6}></Col>

          <Col span={3} style={{ textAlign: "end" }}>
            <div style={{ textAlign: "left", fontSize: 13 }}>Pending Meter</div>
            <Typography
              style={{ color: "red", textAlign: "left", fontWeight: 600 }}
            >
              <div style={{ fontSize: 15 }}>{pendingMeter || 0}</div>
            </Typography>
          </Col>

          <Col span={3} style={{ textAlign: "left" }}>
            <div style={{ textAlign: "left", fontSize: 13 }}>Pending Taka</div>
            <Typography
              style={{ color: "red", textAlign: "left", fontWeight: 600 }}
            >
              <div style={{ fontSize: 15 }}>{pendingTaka || 0}</div>
            </Typography>
          </Col>
        </Row>
      ) : null}

      <Row
        gutter={18}
        style={{
          padding: "12px",
          marginTop: "-15px",
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
              render={({ field }) => (
                <Input {...field} readOnly placeholder="GST In" />
              )}
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
          marginTop: "-25px",
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
                  ></Checkbox.Group>
                );
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider style={{ marginTop: "-15px" }} />

      {/* ================= Sale challan information related table ================  */}

      {quality_id !== undefined && quality_id !== null && (
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
          setSaleChallanTypes={setSaleChallanTypes}
          quality_id={quality_id}
        />
      )}

      <Row style={{ marginTop: "20px" }} gutter={18}>
        <Col span={6}>
          <Form.Item label="Total Taka">
            <Input value={totalTaka.toFixed(2)} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Total Meter">
            <Input value={totalMeter.toFixed(2)} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Total Weight">
            <Input value={totalWeight.toFixed(2)} disabled />
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

export default AddSaleChallan;
