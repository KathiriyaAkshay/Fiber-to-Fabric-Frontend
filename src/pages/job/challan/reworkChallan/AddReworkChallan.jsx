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
import {
  addReworkChallanRequest,
  createReworkChallanNewOptionRequest,
  getReworkChallanLastNumberRequest,
  getReworkOptionsListRequest,
} from "../../../../api/requests/job/challan/reworkChallan";
import dayjs from "dayjs";
import moment from "moment/moment";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import ReworkChallanFieldTable from "../../../../components/job/challan/reworkChallan/reworkChallanFieldTable";
import AlertModal from "../../../../components/common/modal/alertModal";
import { JOB_QUALITY_TYPE } from "../../../../constants/supplier";
import { JOB_REWORK_SUPPLIER_TYPE } from "../../../../constants/supplier";
import { getDisplayQualityName } from "../../../../constants/nameHandler";

const addJobTakaSchemaResolver = yupResolver(
  yup.object().shape({
    delivery_address: yup.string().required("Please enter delivery address."),
    gst_in_1: yup.string().required("Please enter GST In."),
    gst_in_2: yup.string().required("Please enter GST In."),
    challan_no: yup.string().required("Please enter challan no."),
    supplier_id: yup.string().required("Please select supplier."),
    quality_id: yup.string().required("Please select quality."),
    total_meter: yup.string().required("Please enter total meter."),
    taka_receive_meter: yup
      .string()
      .required("Please enter total receive meter."),
    total_taka: yup.string().required("Please enter total taka."),
  })
);

const AddReworkChallan = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeField, setActiveField] = useState(1);
  const [totalTaka, setTotalTaka] = useState(0);
  const [totalMeter, setTotalMeter] = useState(0);
  const [totalReceiveMeter, setTotalReceiveMeter] = useState(0);
  const [deletedRecords, setDeletedRecords] = useState([]);

  const { companyId, company } = useContext(GlobalContext);
  function goBack() {
    navigate(-1);
  }

  // Add work challan related handler =================================
  const { mutateAsync: AddReworkChallan, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await addReworkChallanRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["rework", "challan", "add"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["rework", "challan", "list", companyId]);
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

  // CreateReworkChallanOption
  const [otherOptionValue, setOtherOptionValue] = useState(null);
  const {
    mutateAsync: createReworkChallanOption,
    isPending: iscreateReworkChallanLoading,
  } = useMutation({
    mutationFn: async (data) => {
      const res = await createReworkChallanNewOptionRequest({
        data: data,
        params: {
          company_id: companyId,
        },
      });
      return res?.data;
    },
    mutationKey: ["rework", "challan", "option"],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "reworkOption",
        "dropdown",
        "list",
        { company_id: companyId },
      ]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success("Successfully add new option");
        setValue("option", "");
      }
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  async function onSubmit(data) {
    const detailArray = Array.from({ length: activeField }, (_, i) => i + 1);

    let hasError = 0;
    let temp = [];

    detailArray?.map((field, index) => {
      let taka_no = +data[`taka_no_${field}`];
      let meter = +data[`meter_${field}`];

      if ((isNaN(taka_no) || !taka_no) && !isNaN(meter)) {
        message.error("Please, Provide valid taka details");
        setError(`taka_no_${field}`, {
          type: "manual",
          message: "Taka No required.",
        });
        hasError = 1;
        return;
      } else if ((isNaN(meter) || !meter) && !isNaN(taka_no)) {
        message.error(`Please, Provide valid details for taka ${taka_no}`);
        setError(`meter_${field}`, {
          type: "manual",
          message: "Taka No required.",
        });
        hasError = 1;
        return;
      }

      if (!isNaN(taka_no) && !isNaN(meter)) {
        temp.push({
          index: index + 1,
          taka_no: +data[`taka_no_${field}`],
          meter: +data[`meter_${field}`],
          received_meter: +data[`received_meter_${field}`] || 0,
          received_weight: +data[`received_weight_${field}`] || 0,
          short: +data[`short_${field}`] || 100,
        });
      }
    });

    const newData = {
      createdAt: dayjs(data.challan_date).format("YYYY-MM-DD"),
      machine_name: data.machine_name,
      quality_id: +data.quality_id,
      option: data.option,
      challan_no: data.challan_no,
      supplier_id: +data.supplier_id,
      vehicle_id: +data.vehicle_id,
      total_taka: +data.total_taka,
      total_meter: +data.total_meter,
      taka_receive_meter: +data.taka_receive_meter,
      details: temp,
    };

    if (hasError === 0) {
      await AddReworkChallan(newData);
    }
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
    setFocus,
    resetField,
    setError,
  } = useForm({
    defaultValues: {
      company_id: null,
      challan_date: dayjs(),
      delivery_address: "",
      gst_state: "",
      gst_in_1: "",
      gst_in_2: "",
      challan_no: "",

      supplier_name: null,
      supplier_id: null,

      machine_name: null,
      quality_id: null,

      total_taka: "",
      total_meter: "",
      taka_receive_meter: "",
    },
    resolver: addJobTakaSchemaResolver,
  });
  const { supplier_name, supplier_id, machine_name, quality_id, option } =
    watch();

  // Machine list dropdown api ==================================================
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

  // Rework option list
  const [reworkChallanOption, setReworkChallanOption] = useState([
    { label: "Other", value: "Other" },
  ]);

  const { data: reworkOptionsListRes, isLoading: isLoadingReworkOptionList } =
    useQuery({
      queryKey: ["reworkOption", "dropDown", "list", { company_id: companyId }],
      queryFn: async () => {
        const res = await getReworkOptionsListRequest({
          companyId,
          params: { company_id: companyId },
        });
        let temp = res?.data?.data?.map((option) => {
          return { label: option.option, value: option.option };
        });
        setReworkChallanOption([...temp, ...reworkChallanOption]);
      },
      enabled: Boolean(companyId),
    });

  // Dropdown quality list =================================================
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
          machine_name: machine_name,
          production_type: JOB_QUALITY_TYPE
        },
      ],
      queryFn: async () => {
        if (machine_name) {
          const res = await getInHouseQualityListRequest({
            params: {
              company_id: companyId,
              page: 0,
              pageSize: 9999,
              is_active: 1,
              machine_name: machine_name,
              production_type: JOB_QUALITY_TYPE
            },
          });
          return res.data?.data;
        }
      },
      enabled: Boolean(companyId),
    });

  // Vehicle dropdown list
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

  // Dropdown supplier list request ===========================================
  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: ["dropdown/supplier/list", { company_id: companyId, supplier_type: JOB_REWORK_SUPPLIER_TYPE }],
    queryFn: async () => {
      const res = await getDropdownSupplierListRequest({
        params: { company_id: companyId, supplier_type: JOB_REWORK_SUPPLIER_TYPE },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(companyId),
  });

  // Get job rework challan last challan number information
  const { data: lastChallanNumber, isLoad: lastChllanNumberLoading } = useQuery(
    {
      queryKey: [
        "job/challan/rework/last-challan-no",
        { company_id: companyId },
      ],
      queryFn: async () => {
        const res = await getReworkChallanLastNumberRequest({
          params: { company_id: companyId },
        });

        if (res?.data?.data?.challan_no == null || res?.data?.data?.challan_no == undefined){
          return 1 ; 
        } else {
          let challanNumber = Number(res?.data?.data?.challan_no) || 0;
          challanNumber = challanNumber + 1;
          setValue(`challan_no`, challanNumber);
          return challanNumber;
        }
      },
      enabled: Boolean(companyId),
    }
  );

  const dropDownSupplierCompanyOption = useMemo(() => {
    if (
      supplier_name &&
      dropdownSupplierListRes &&
      dropdownSupplierListRes.length
    ) {
      resetField("supplier_id");
      resetField("delivery_address");
      resetField("gst_in_2");
      const obj = dropdownSupplierListRes.find((item) => {
        return item.supplier_name === supplier_name;
      });
      return obj?.supplier_company;
    } else {
      return [];
    }
  }, [supplier_name, dropdownSupplierListRes, resetField]);

  useEffect(() => {
    setValue("gst_in_1", company?.gst_no);
  }, [company, setValue]);

  useEffect(() => {
    if (supplier_id) {
      const selectedSupplierCompany = dropDownSupplierCompanyOption.find(
        (item) => item.supplier_id === supplier_id
      );
      setValue("delivery_address", selectedSupplierCompany?.users?.address);
      setValue("gst_in_2", selectedSupplierCompany?.users?.gst_no);
    }
  }, [supplier_id, dropDownSupplierCompanyOption, setValue]);

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

  // **************************************************************

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [tempOrderValue, setTempOrderValue] = useState(null);

  const qualityChangeHandler = (field, selectedValue) => {
    setTempOrderValue(selectedValue);
    if (activeField >= 1) {
      if (
        getValues(`taka_no_1`) ||
        getValues(`meter_1`) ||
        getValues(`received_meter_1`) ||
        getValues(`received_weight__1`) ||
        getValues(`short_1`)
        // getValues(`production_meter_1`) ||
        // getValues(`pending_meter_1`) ||
        // getValues(`pending_percentage_1`)
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
      resetField(`received_meter_${field}`, "");
      resetField(`received_weight_${field}`, "");
      resetField(`short_${field}`, "");
    });

    setValue("quality_id", tempOrderValue);
    setActiveField(1);
    setIsAlertOpen(false);
  };

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Create Rework Challan</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
            marginTop: "-10px",
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
                    disabledDate={disabledFutureDate}
                    {...field}
                    style={{ width: "100%" }}
                    format={"DD-MM-YYYY"}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Machine Name"
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
                    allowClear
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
                          label: getDisplayQualityName(item),
                        }))
                      }
                      onChange={(value) => {
                        // field.onChange(value);
                        qualityChangeHandler(field, value);
                      }}
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Option"
              name="option"
              validateStatus={errors.option ? "error" : ""}
              help={errors.option && errors.option.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="option"
                render={({ field }) => (
                  <>
                    <Select
                      {...field}
                      allowClear
                      placeholder="Select option"
                      loading={isLoadingReworkOptionList}
                      options={reworkChallanOption}
                      style={{
                        textTransform: "capitalize",
                      }}
                      dropdownStyle={{
                        textTransform: "capitalize",
                      }}
                    />

                    {option == "other" && (
                      <Flex gap={5} style={{ marginTop: "10px" }}>
                        <Input
                          value={otherOptionValue}
                          onChange={(e) => {
                            setOtherOptionValue(e.target.value);
                          }}
                        />
                        <Button
                          type="primary"
                          loading={iscreateReworkChallanLoading}
                          onClick={async () => {
                            await createReworkChallanOption({
                              option: otherOptionValue,
                            });
                          }}
                        >
                          Add
                        </Button>
                      </Flex>
                    )}
                  </>
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
                  <Input
                    {...field}
                    value={lastChallanNumber}
                    placeholder="CH123456"
                    readOnly
                  />
                )}
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
            padding: "12px",
            marginTop: "-30px",
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
                  return (
                    <Input {...field} placeholder="Delivery Address" disabled />
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

        <Divider style={{ marginTop: "-15px" }} />

        {/* Rework challan table information  */}
        {quality_id !== undefined && quality_id !== null && (
          <ReworkChallanFieldTable
            errors={errors}
            control={control}
            setFocus={setFocus}
            setValue={setValue}
            getValues={getValues}
            activeField={activeField}
            setActiveField={setActiveField}
            quality_id={quality_id}
            totalTaka={totalTaka}
            setTotalTaka={setTotalTaka}
            totalMeter={totalMeter}
            setTotalMeter={setTotalMeter}
            totalReceiveMeter={totalReceiveMeter}
            setTotalReceiveMeter={setTotalReceiveMeter}
            setDeletedRecords={setDeletedRecords}
            deletedRecords={deletedRecords}
          />
        )}

        <Flex gap={10} justify="flex-end" style={{ marginTop: "1rem" }}>
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

export default AddReworkChallan;
