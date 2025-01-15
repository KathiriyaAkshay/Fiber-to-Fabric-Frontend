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
import { useNavigate, useParams } from "react-router-dom";
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
  getReworkChallanByIdRequest,
  getReworkOptionsListRequest,
  updateReworkChallanRequest,
} from "../../../../api/requests/job/challan/reworkChallan";
import dayjs from "dayjs";
import moment from "moment/moment";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import ReworkChallanFieldTable from "../../../../components/job/challan/reworkChallan/reworkChallanFieldTable";
import AlertModal from "../../../../components/common/modal/alertModal";
import { getDisplayQualityName } from "../../../../constants/nameHandler";
import { JOB_REWORK_SUPPLIER_TYPE, JOB_SUPPLIER_TYPE } from "../../../../constants/supplier";
import { JOB_QUALITY_TYPE } from "../../../../constants/supplier";

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

const UpdateReworkChallan = () => {
  const params = useParams();
  const { id } = params;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeField, setActiveField] = useState(1);
  const [totalTaka, setTotalTaka] = useState(0);
  const [totalMeter, setTotalMeter] = useState(0);
  const [totalReceiveMeter, setTotalReceiveMeter] = useState(0);
  const [deletedRecords, setDeletedRecords] = useState([]);

  const { companyId, companyListRes } = useContext(GlobalContext);
  function goBack() {
    navigate(-1);
  }

  const { data: reworkChallanDetails } = useQuery({
    queryKey: ["reworkChallanDetails", "get", id, { company_id: companyId }],
    queryFn: async () => {
      const res = await getReworkChallanByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: UpdateReworkChallan, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await updateReworkChallanRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["rework", "challan", "update"],
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

  async function onSubmit(data) {
    const detailArray = Array.from({ length: activeField }, (_, i) => i + 1);

    let hasError = 0;
    let temp = [];

    detailArray?.map((field, index) => {
      let taka_no = +data[`taka_no_${field}`];
      let meter = +data[`meter_${field}`];
      let id = data[`id_${field}`];
      // let received_meter = +data[`received_meter_${field}`];
      // let received_weight = +data[`received_weight_${field}`];
      // let short = +data[`short_${field}`];

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

      if (!id && !isNaN(taka_no) && !isNaN(meter)) {
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
      // createdAt: dayjs(data.challan_date).format("YYYY-MM-DD"),
      // machine_name: data.machine_name,
      // quality_id: +data.quality_id,
      // option: data.option,
      // challan_no: data.challan_no,
      // supplier_id: +data.supplier_id,
      vehicle_id: +data.vehicle_id,
      // total_taka: +data.total_taka,
      // total_meter: +data.total_meter,
      // taka_receive_meter: +data.taka_receive_meter,
      total_taka: +totalTaka,
      total_meter: +totalMeter,
      // taka_receive_meter: +totalReceiveMeter,

      details: temp,
      deleted_rework_taka_ids: deletedRecords.map((item) => item.id),
    };

    if (hasError === 0) {
      await UpdateReworkChallan(newData);
    }
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    setFocus,
    reset,
    setError,
    resetField,
  } = useForm({
    defaultValues: {
      company_id: null,
      challan_date: dayjs(),
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
  const { supplier_name, company_id, supplier_id, machine_name, quality_id } =
    watch();

  // Machinename dropdown list
  const { data: machineListRes, isLoading: isLoadingMachineList } = useQuery({
    queryKey: ["machine", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getCompanyMachineListRequest({
        companyId,
        params: { company_id: companyId},
      });
      return res.data?.data?.machineList;
    },
    enabled: Boolean(companyId),
  });

  const { data: reworkOptionsListRes, isLoading: isLoadingReworkOptionList } =
    useQuery({
      queryKey: ["reworkOption", "dropDown", "list", { company_id: companyId }],
      queryFn: async () => {
        const res = await getReworkOptionsListRequest({
          companyId,
          params: { company_id: companyId },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  // Quality dropdown list
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

  // Vechicle dropdown list
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

  // Supplierdropdown list
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
      setValue("gst_in_2", selectedSupplierCompany?.users?.gst_no || "GST");
    }
  }, [supplier_id, dropDownSupplierCompanyOption, setValue]);

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

  useEffect(() => {
    if (reworkChallanDetails) {
      const {
        company_id,
        challan_no,
        option,
        quality_id,
        machine_name,
        supplier_id,
        total_meter,
        total_taka,
        taka_receive_meter,
        supplier,
        createdAt,
        vehicle_id,
        job_rework_challan_details,
      } = reworkChallanDetails;

      const selectedCompany = companyListRes?.rows?.find(
        ({ id }) => id === company_id
      );

      setActiveField(job_rework_challan_details.length + 1);
      let jobReworkChallanDetails = {};
      let totalTaka = 0;
      let totalMeter = 0;
      let totalReceiveMeter = 0;
      job_rework_challan_details.forEach((item, index) => {
        jobReworkChallanDetails[`id_${index + 1}`] = item.id;
        jobReworkChallanDetails[`taka_no_${index + 1}`] = item.taka_no;
        jobReworkChallanDetails[`meter_${index + 1}`] = item.meter;
        jobReworkChallanDetails[`received_meter_${index + 1}`] =
          item.received_meter;
        jobReworkChallanDetails[`received_weight_${index + 1}`] =
          item.received_weight;
        jobReworkChallanDetails[`short_${index + 1}`] = item.short;

        totalTaka += 1;
        totalMeter += item.meter;
        totalReceiveMeter += item.received_meter;
      });

      setTotalTaka(totalTaka);
      setTotalMeter(totalMeter);
      setTotalReceiveMeter(totalReceiveMeter);

      reset({
        company_id,
        challan_date: dayjs(createdAt),
        gst_in_1: selectedCompany.gst_no,
        gst_in_2: supplier.user.gst_no || "GST",
        challan_no,
        option,
        vehicle_id,
        supplier_name: supplier?.supplier_name,
        supplier_id: supplier_id,
        machine_name,
        quality_id,
        total_taka,
        total_meter,
        taka_receive_meter,
        ...jobReworkChallanDetails,
        delivery_address: reworkChallanDetails?.supplier?.user?.address,
      });
    }
  }, [reworkChallanDetails, reset, company_id, companyListRes?.rows]);

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
      // resetField(`production_meter_${field}`, "");
      // resetField(`pending_meter_${field}`, "");
      // resetField(`pending_percentage_${field}`, "");
    });

    setValue("quality_id", tempOrderValue);
    setActiveField(1);
    setIsAlertOpen(false);
    // setTotalTaka(0);
    // setTotalMeter(0);
    // setTotalWeight(0);
  };

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Edit Rework Challan</h3>
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
                    disabled
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
                      disabled
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
                  <Select
                    {...field}
                    allowClear
                    placeholder="Select option"
                    loading={isLoadingReworkOptionList}
                    options={
                      reworkOptionsListRes &&
                      reworkOptionsListRes?.map((option) => {
                        return { label: option.option, value: option.option };
                      })
                    }
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
                  <Input {...field} readOnly placeholder="CH123456" />
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
                    <Input {...field} placeholder="Delivery Address" readOnly />
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

        <Divider />

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

export default UpdateReworkChallan;
