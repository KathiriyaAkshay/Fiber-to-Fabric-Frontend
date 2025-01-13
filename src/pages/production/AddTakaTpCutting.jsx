import { useContext, useEffect, useState } from "react";
import {
  Button,
  Radio,
  Form,
  Input,
  Select,
  Row,
  Col,
  DatePicker,
  Flex,
  Card,
  Typography,
  message,
  Divider,
} from "antd";
import { getCompanyMachineListRequest } from "../../api/requests/machine";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GlobalContext } from "../../contexts/GlobalContext";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { getInHouseQualityListRequest } from "../../api/requests/qualityMaster";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  addTakaTpCuttingRequest,
  getTakaCuttingSrNoRequest,
} from "../../api/requests/production/takaTpCutting";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ORDER_TYPE } from "../../constants/orderMaster";
import { createSaleChallanTakaDetailRequest } from "../../api/requests/sale/challan/challan";
import { useDebounceCallback } from "../../hooks/useDebounce";
import { disabledFutureDate } from "../../utils/date";
import { getDisplayQualityName } from "../../constants/nameHandler";

const addTakaTpCuttingResolver = yupResolver(
  yup.object().shape({
    quality_id: yup.string().required("Please select quality."),
    total_meter: yup.string().required("Please enter total meter."),
    total_weight: yup.string().required("Please enter total weight."),
    sr_no_1: yup.string().required("Please enter sr number."),
    sr_no_2: yup.string().required("Please enter sr number."),
    machine_name: yup.string().required("Please select machine name."),
    from_type: yup.string().required("Please enter from type."),
    to_type: yup.string().required("Please enter to type."),
    from_taka: yup.string().required("Please enter from taka."),
    to_taka: yup.string().required("Please enter to taka."),
    remark: yup.string().required("Please enter remark."),
  })
);

const AddTakaTpCutting = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { companyId } = useContext(GlobalContext);

  const { mutateAsync: addTakaTpCuttingHandler, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await addTakaTpCuttingRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "taka", "tp", "cutting"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["tpCutting", "list", companyId]);
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
    const payload = {
      machine_name: data.machine_name,
      quality_id: +data.quality_id,
      from_type: data.from_type,
      to_type: data.to_type,
      from_taka: +data.from_taka,
      to_taka: +data.to_taka,
      total_meter: +data.total_meter,
      total_weight: +data.total_weight,
      remark: data.remark,
      is_taka_tp: data.option === "taka_tp",
      is_sample_cutting: data.option === "sample_cutting",
      is_cut: data.option === "cut",
      sr_number: `${data?.sr_no_1}-${data?.sr_no_2}`
    };
    await addTakaTpCuttingHandler(payload);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    resetField,
    reset,
    setValue,
    getValues
  } = useForm({
    defaultValues: {
      sr_no_1: "",
      sr_no_2: "",
      machine_name: null,
      quality_id: null,
      option: "taka_tp",
      from_type: "taka(inhouse)",
      to_type: "taka(inhouse)",
      from_taka: "",
      to_taka: "",
      total_meter: "",
      total_weight: "",
      remark: "",
      date: dayjs(),
    },
    resolver: addTakaTpCuttingResolver,
  });
  const { machine_name, from_type, to_type, option } = watch();

  // Machinename dropdown list request api =============================
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

  const { data: SrNoData } = useQuery({
    queryKey: ["takaCutting", "SrNo", { company_id: companyId }],
    queryFn: async () => {
      const res = await getTakaCuttingSrNoRequest({
        params: { company_id: companyId },
      });

      if (res?.data?.data == null){
        return 0; 
      } else {
        let split = +String(res?.data?.data).split("-")[1] ; 
        return split ; 
      }
    },
    enabled: Boolean(companyId),
  });

  // Quality list related dropdown list  ====================
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

  useEffect(() => {
    setValue("sr_no_1", "TCP");
    setValue("sr_no_2", SrNoData ? SrNoData + 1 : 1);
  }, [SrNoData, setValue]);

  const [isValidFromTakaNo, setIsValidFromTakaNo] = useState(true);
  const [isValidToTakaNo, setIsValidToTakaNo] = useState(true);
  const [fromTakaInfo, setFromTakaInfo] = useState({}) ; 
  const [toTakaInfo, setToTakaInfo] = useState({}); 

  const checkTakaNo = async (type, takaNo, isFrom) => {
    let machine_name = getValues("machine_name") ; 
    let quality_id = getValues("quality_id") ; 
    let from_taka_number = getValues("from_taka") ; 
    let to_taka_number = getValues("to_taka") ; 
  
    if (machine_name == null || machine_name == undefined || machine_name == ""){
      message.error("Please, Select Machine name") ;  
      setValue("from_taka", undefined) ; 
      setValue("to_taka", undefined) ; 
    
    } else if (quality_id == null || quality_id == undefined || quality_id == ""){
      message.error("Please, Select Quality") ; 
      setValue("from_taka", undefined) ; 
      setValue("to_taka", undefined) ; 
    
    } else if (from_taka_number == to_taka_number){
      message.error("Please, Provide different taka number") ;
      setValue("from_taka", undefined) ; 
      setValue("to_taka", undefined) ; 

    } else {
      try {
        const data = {
          sale_challan_type: [type],
        };
        
        const response = await createSaleChallanTakaDetailRequest({
          data,
          params: {
            company_id: companyId,
            taka_no: takaNo,
            quality_id: quality_id
          },
        });
        if (response.data.success) {
          if (isFrom){
            setFromTakaInfo({
              meter: response?.data?.data?.meter, 
              weight: response?.data?.data?.weight
            })
          } else {
            setToTakaInfo({
              meter: response?.data?.data?.meter, 
              weight: response?.data?.data?.weight
            })
          }
          isFrom && setIsValidFromTakaNo(true);
          !isFrom && setIsValidToTakaNo(true);
        } else {
          setFromTakaInfo(null) ; 
          setToTakaInfo(null) ; 
          isFrom && setIsValidFromTakaNo(false);
          !isFrom && setIsValidToTakaNo(false);
        }
      } catch (error) {
        message.error(error.response.data.message);
        isFrom && setIsValidFromTakaNo(false);
        !isFrom && setIsValidToTakaNo(false);
      }
    }
  };

  const debouncedCheckUniqueTakaHandler = useDebounceCallback(
    (type, takaNo, isFrom) => {
      checkTakaNo(type, takaNo, isFrom);
    },
    500
  );

  const MeterChangeHandler = (value) => {
    if (fromTakaInfo !== null && toTakaInfo !== null){
      let totalMeter = 0 ; 
      totalMeter = totalMeter + Number(fromTakaInfo?.meter) ; 
      totalMeter = totalMeter + Number(toTakaInfo?.meter) ; 
      
      let totalWeight = 0; 
      totalWeight = totalWeight + Number(fromTakaInfo?.weight) ; 
      totalWeight = totalWeight + Number(toTakaInfo?.weight) ; 
    
      let tempWeight = Number(value)*totalWeight / totalMeter ; 
      setValue("total_weight", tempWeight.toFixed(2))
    }
    
  }

  useEffect(() => {
    if (fromTakaInfo !== null && toTakaInfo !== null){
      MeterChangeHandler() ; 
    } else {
      setValue("total_weight", undefined) ;
    }
  }, [fromTakaInfo, toTakaInfo])

  return (
    <Form
      form={form}
      layout="vertical"
      style={{ marginTop: "1rem" }}
      onFinish={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-5">
            <Button onClick={() => navigate(-1)}>
              <ArrowLeftOutlined />
            </Button>
            <h3 className="m-0 text-primary">Taka TP/Cutting</h3>
          </div>
        </div>

        <Row className="w-100" justify={"flex-start"} style={{ gap: "12px" }}>
          <Col span={8}>
            <Card style={{ borderColor: "#194A6D", height: "100%" }}>
              <Flex gap={12}>
                <Typography.Text style={{ whiteSpace: "nowrap" }}>
                  Sr. Number :
                </Typography.Text>
                <Form.Item
                  name="sr_no_1"
                  validateStatus={errors.sr_no_1 ? "error" : ""}
                  help={errors.sr_no_1 && errors.sr_no_1.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="sr_no_1"
                    render={({ field }) => (
                      <Input name="sr_no_1" {...field} disabled />
                    )}
                  />
                </Form.Item>
                <Form.Item
                  name="sr_no_2"
                  validateStatus={errors.sr_no_2 ? "error" : ""}
                  help={errors.sr_no_2 && errors.sr_no_2.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="sr_no_2"
                    render={({ field }) => (
                      <Input name="sr_no_2" {...field} disabled />
                    )}
                  />
                </Form.Item>
              </Flex>

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
                      onChange={(value) => {
                        field.onChange(value);
                        resetField("quality_id");
                      }}
                    />
                  )}
                />
              </Form.Item>

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
            </Card>
          </Col>

          <Col span={9}>
            <Card style={{ borderColor: "#194A6D", height: "100%" }}>
              <Form.Item
                label=""
                name={`option`}
                validateStatus={errors.option ? "error" : ""}
                help={errors.option && errors.option.message}
                required={true}
                wrapperCol={{ sm: 24 }}
                style={{
                  marginBottom: "0px",
                  border: "0px solid !important",
                }}
              >
                <Controller
                  control={control}
                  name={`option`}
                  render={({ field }) => (
                    <Radio.Group {...field} name="option">
                      <Radio value={"taka_tp"}>Taka TP</Radio>
                      <Radio value={"sample_cutting"}>Sample Cutting</Radio>
                      <Radio value={"cut"}>Cut</Radio>
                    </Radio.Group>
                  )}
                />
              </Form.Item>

              <Divider />

              <Flex style={{ marginTop: "1rem", gap: "12px" }}>

                <Form.Item
                  label="From Type"
                  name="from_type"
                  validateStatus={errors.from_type ? "error" : ""}
                  help={errors.from_type && errors.from_type.message}
                  wrapperCol={{ sm: 24 }}
                  className="flex-grow"
                >
                  <Controller
                    control={control}
                    name="from_type"
                    render={({ field }) => (
                      <Select {...field} options={ORDER_TYPE} />
                    )}
                  />
                </Form.Item>

                {option == "taka_tp" && (
                  <Form.Item
                    label="To Type"
                    name="to_type"
                    validateStatus={errors.to_type ? "error" : ""}
                    help={errors.to_type && errors.to_type.message}
                    wrapperCol={{ sm: 24 }}
                    className="flex-grow"
                  >
                    <Controller
                      control={control}
                      name="to_type"
                      render={({ field }) => (
                        <Select {...field} options={ORDER_TYPE} />
                      )}
                    />
                  </Form.Item>
                )}
                

              </Flex>

              <Flex style={{ marginTop: "1rem", gap: "12px" }}>
                <Form.Item
                  label="From Taka"
                  name={`from_taka`}
                  validateStatus={errors.from_taka ? "error" : ""}
                  help={errors.from_taka && errors.from_taka.message}
                  wrapperCol={{ sm: 24 }}
                  style={{
                    width: "100%",
                  }}
                >
                  <Controller
                    control={control}
                    name={`from_taka`}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        placeholder="101"
                        onChange={(e) => {
                          field.onChange(+e.target.value);
                          debouncedCheckUniqueTakaHandler(
                            from_type,
                            +e.target.value,
                            true
                          );
                        }}
                      />
                    )}
                  />
                </Form.Item>

                {option == "taka_tp" && (
                  <Form.Item
                    label="To Taka"
                    name={`to_taka`}
                    validateStatus={errors.to_taka ? "error" : ""}
                    help={errors.to_taka && errors.to_taka.message}
                    wrapperCol={{ sm: 24 }}
                    style={{
                      width: "100%",
                    }}
                  >
                    <Controller
                      control={control}
                      name={`to_taka`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          placeholder="101"
                          onChange={(e) => {
                            field.onChange(+e.target.value);
                            debouncedCheckUniqueTakaHandler(
                              to_type,
                              +e.target.value,
                              false
                            );
                          }}
                        />
                      )}
                    />
                  </Form.Item>
                )}

              </Flex>

              <Flex style={{ marginTop: "1rem", gap: "12px" }}>
                <Form.Item
                  label="Total Meter"
                  name={`total_meter`}
                  validateStatus={errors.total_meter ? "error" : ""}
                  help={errors.total_meter && errors.total_meter.message}
                  wrapperCol={{ sm: 24 }}
                  style={{ width: "100%" }}
                >
                  <Controller
                    control={control}
                    name={`total_meter`}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        placeholder="101"
                        onChange={(e) => {
                          field.onChange(+e.target.value)
                          MeterChangeHandler(e.target.value) ; 
                        }}
                      />
                    )}
                  />
                </Form.Item>

                <Form.Item
                  label="Total Weight"
                  name={`total_weight`}
                  validateStatus={errors.total_weight ? "error" : ""}
                  help={errors.total_weight && errors.total_weight.message}
                  wrapperCol={{ sm: 24 }}
                  style={{ width: "100%" }}
                >
                  <Controller
                    control={control}
                    name={`total_weight`}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        placeholder="101"
                        readOnly
                        onChange={(e) => field.onChange(+e.target.value)}
                      />
                    )}
                  />
                </Form.Item>
              </Flex>
            </Card>
          </Col>

          <Col span={6}>
            <Card
              style={{
                borderColor: "#194A6D",
                maxWidth: "400px",
                height: "100%",
              }}
            >
              <Form.Item
                label="Remark"
                name="remark"
                validateStatus={errors.remark ? "error" : ""}
                help={errors.remark && errors.remark.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="remark"
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter remark"
                      style={{ width: "100%" }}
                    />
                  )}
                />
              </Form.Item>
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
                  render={({ field }) => (
                    <DatePicker disabledDate={disabledFutureDate} {...field} style={{ width: "100%" }} />
                  )}
                />
              </Form.Item>

              <Flex gap={10} justify="flex-end">
                <Button htmlType="button" onClick={() => reset()}>
                  Reset
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isPending}
                  disabled={!isValidFromTakaNo || !isValidToTakaNo}
                >
                  Create
                </Button>
              </Flex>
            </Card>
          </Col>
        </Row>
      </div>
    </Form>
  );
};

export default AddTakaTpCutting;
