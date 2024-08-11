import { useContext, useMemo, useState } from "react";
import {
  Button,
  Radio,
  Form,
  Input,
  Select,
  Row,
  Col,
  DatePicker,
  Checkbox,
  Flex,
  message,
  Typography,
} from "antd";
import { getCompanyMachineListRequest } from "../../api/requests/machine";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GlobalContext } from "../../contexts/GlobalContext";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { getInHouseQualityListRequest } from "../../api/requests/qualityMaster";
import AddProductionTable from "../../components/production/AddProductionTable";
import {
  addProductionRequest,
  getLastProductionTakaRequest,
} from "../../api/requests/production/inhouseProduction";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getBeamCardListRequest,
  getLoadedMachineListRequest,
} from "../../api/requests/beamCard";
import { disabledFutureDate } from "../../utils/date";

const AddProduction = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { companyId } = useContext(GlobalContext);

  const [activeField, setActiveField] = useState(1);
  const [weightPlaceholder, setWeightPlaceholder] = useState(null);

  // Add New Production option handler ===================================================================================
  const { mutateAsync: addNewProduction, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await addProductionRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "production"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["production", "list", companyId]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success("Production add successfully");
      }
      navigate("/production/inhouse-production");
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const onSubmit = async (data) => {
    const array = Array.from({ length: activeField }, (_, i) => i + 1);

    const newData = array.map((fieldNumber) => {

      const beamCard = beamCardList.rows.find(({ machine_no }) => {
        return machine_no === data[`machine_no_${fieldNumber}`];
      });
      if (beamCard !== undefined){
        const payload = {
          machine_name: data.machine_name,
          production_date: dayjs(data.date).format("YYYY-MM-DD"),
          last_enter_taka_no: data.last_taka_no || 1,
          taka_no: +(+lastProductionTaka?.taka_no + fieldNumber),
          meter: +data[`meter_${fieldNumber}`],
          weight: +data[`weight_${fieldNumber}`],
          machine_no: data[`machine_no_${fieldNumber}`],
          beam_load_id: beamCard.id,
          average: +data[`average_${fieldNumber}`],
          beam_no: data[`beam_no_${fieldNumber}`],
          production_meter: +data[`production_meter_${fieldNumber}`],
          pending_meter: +data[`pending_meter_${fieldNumber}`],
          pending_percentage: +data[`pending_percentage_${fieldNumber}`],
        };

        console.log("Payload information");
        console.log(payload);
        
        
  
        if (data.production_filter !== "multi_quality_wise") {
          payload.quality_id = data.quality_id;
        } else {
          payload.quality_id = data[`quality_${fieldNumber}`];
        }

        if (data.production_filter === "machine_wise") {
          payload.grade = data.grade;
          payload.pis = data.pis;
        }
        return payload;
      }

    });

    // let temp = []; 
    // newData?.map((element) => {
    //   if (element !== undefined){
    //     temp.push(element) ; 
    //   }
    // })
    // await addNewProduction(temp);
  };

  // Add New Production option handler complete ============================================================================

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    resetField,
    setFocus,
    getValues,
    setValue,
    reset,
    setError,
    trigger,
  } = useForm({
    defaultValues: {
      production_filter: "quality_wise",
      date: dayjs(),
      machine_name: null,
      quality_id: null,
      last_taka_no: "",
      last_taka_no_date: dayjs(),
      m_no: null,
      grade: "A",
      pis: "",
    },
    // resolver: addJobTakaSchemaResolver,
  });
  const { machine_name, production_filter, quality_id, m_no } = watch();

  // Last production taka get
  const { data: lastProductionTaka } = useQuery({
    queryKey: ["last", "production", "taka", { company_id: companyId }],
    queryFn: async () => {
      const res = await getLastProductionTakaRequest({
        companyId,
        params: { company_id: companyId },
      });
      setValue("last_taka_no", +res.data?.data?.taka_no);
      setValue("last_taka_no_date", dayjs(res.data?.data?.createdAt));
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  // Get Beamcard list information
  const { data: beamCardList } = useQuery({
    queryKey: [
      "beamCard",
      "list",
      {
        production_filter,
        company_id: companyId,
        machine_name: machine_name,
        quality_id: quality_id,
        machine_no: m_no,
      },
    ],
    queryFn: async () => {
      if (production_filter === "quality_wise" && machine_name && quality_id) {
        const res = await getBeamCardListRequest({
          params: {
            company_id: companyId,
            page: 0,
            pageSize: 99999,
            machine_name: machine_name,
            quality_id: quality_id,
            status: "running",
          },
        });
        return res.data?.data;
      } else if (production_filter === "machine_wise" && machine_name && m_no) {
        const res = await getBeamCardListRequest({
          params: {
            company_id: companyId,
            page: 0,
            pageSize: 99999,
            machine_name: machine_name,
            machine_no: m_no,
            status: "running",
          },
        });
        return res.data?.data;
      } else if (production_filter === "multi_quality_wise" && machine_name) {
        const res = await getBeamCardListRequest({
          params: {
            company_id: companyId,
            page: 0,
            pageSize: 99999,
            machine_name: machine_name,
            // machine_no: m_no,
            status: "running",
          },
        });
        return res.data?.data;
      }
    },
    enabled: Boolean(companyId),
  });

  // Machine name dropdown list
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

  // Quality dropdown list machine name wise
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

  const avgWeight = useMemo(() => {
    if (
      quality_id &&
      dropDownQualityListRes &&
      dropDownQualityListRes?.rows?.length
    ) {
      const quality = dropDownQualityListRes?.rows?.find(
        ({ id }) => quality_id === id
      );
      return { weight_from: quality.weight_from, weight_to: quality.weight_to };
    }
  }, [dropDownQualityListRes, quality_id]);

  const { data: loadedMachineList, isLoading: isLoadingLoadedMachineNo } =
    useQuery({
      queryKey: [
        "loaded",
        "machine",
        "list",
        { company_id: companyId, machine_name, production_filter },
      ],
      queryFn: async () => {
        if (machine_name && production_filter === "machine_wise") {
          const res = await getLoadedMachineListRequest({
            params: { company_id: companyId, machine_name },
          });

          const noOfMachine = res.data?.data?.machineDetail?.no_of_machines;
          return Array.from({ length: noOfMachine }, (_, index) => index + 1);
        }
      },
      enabled: Boolean(companyId),
      initialData: [],
    });

  const changeProductionFilter = (value) => {
    if (value) {
      resetField("machine_name");
      resetField("quality_id");

      const array = Array.from({ length: activeField }, (_, i) => i + 1);
      array.forEach((fieldNumber) => {
        setValue(`meter_${fieldNumber}`, "");
        setValue(`weight_${fieldNumber}`, "");
        setValue(`machine_no_${fieldNumber}`, "");
        setValue(`beam_no_${fieldNumber}`, "");
        setValue(`average_${fieldNumber}`, "");

        setValue(`production_meter_${fieldNumber}`, "");
        setValue(`pending_meter_${fieldNumber}`, "");
        setValue(`pending_percentage_${fieldNumber}`, "");

        trigger(`weight_${fieldNumber}`);
      });
      setActiveField(1);
      setWeightPlaceholder(null);
    }
  };

  const handleQualityChange = () => {
    const array = Array.from({ length: activeField }, (_, i) => i + 1);
    array.forEach((fieldNumber) => {
      setValue(`meter_${fieldNumber}`, "");
      setValue(`weight_${fieldNumber}`, "");
      setValue(`machine_no_${fieldNumber}`, "");
      setValue(`beam_no_${fieldNumber}`, "");
      setValue(`average_${fieldNumber}`, "");

      setValue(`production_meter_${fieldNumber}`, "");
      setValue(`pending_meter_${fieldNumber}`, "");
      setValue(`pending_percentage_${fieldNumber}`, "");

      trigger(`weight_${fieldNumber}`);
    });
    setActiveField(1);
    setWeightPlaceholder(null);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      style={{ marginTop: "1rem" }}
      onFinish={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-2 p-4 pt-2">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-5">
            <Button onClick={() => navigate(-1)}>
              <ArrowLeftOutlined />
            </Button>
            <h3 className="m-0 text-primary">Add Production</h3>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <Controller
              control={control}
              name="production_filter"
              render={({ field }) => (
                <Radio.Group
                  {...field}
                  name="production_filter"
                  onChange={(e) => {
                    field.onChange(e);
                    changeProductionFilter(e.target.value);
                  }}
                >
                  <Radio value={"quality_wise"}>Quality Wise</Radio>
                  <Radio value={"machine_wise"}>Machine Wise</Radio>
                  <Radio value={"multi_quality_wise"}>Multi Quality Wise</Radio>
                </Radio.Group>
              )}
            />
          </div>

          {production_filter == "machine_wise" && (
            <Controller
              control={control}
              name="generate_qr_code"
              render={({ field }) => (
                <Checkbox
                  {...field}
                  name="generate_qr_code"
                  checked={field.value}
                >
                  Generate QR Code
                </Checkbox>
              )}
            />
          )}
        </div>

        <Row className="w-100" justify={"flex-start"} style={{ gap: "12px" }}>
          <Col span={7}>
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
          </Col>

          {production_filter != "multi_quality_wise" && (
            <Col span={7}>
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
                          onChange={(value) => {
                            field.onChange(value);
                            handleQualityChange();
                          }}
                        />
                        {quality_id && (
                          <Typography.Text style={{ color: "red" }}>
                            Avg weight must be between {avgWeight?.weight_from}{" "}
                            to {avgWeight?.weight_to}
                          </Typography.Text>
                        )}
                      </>
                    );
                  }}
                />
              </Form.Item>
            </Col>
          )}

          <Col span={7}>
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
                  <DatePicker
                    {...field}
                    style={{ width: "100%" }}
                    disabledDate={disabledFutureDate}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row
          style={{ gap: "16px", marginTop: "-25px" }}
          className="w-100"
          justify={"start"}
        >
          {production_filter == "machine_wise" && (
            <Col span={4}>
              <Form.Item
                label="M. No"
                name="m_no"
                validateStatus={errors.m_no ? "error" : ""}
                help={errors.m_no && errors.m_no.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="m_no"
                  render={({ field }) => (
                    <Select
                      {...field}
                      name="m_no"
                      style={{
                        width: "100%",
                      }}
                      showSearch
                      loading={isLoadingLoadedMachineNo}
                      options={loadedMachineList.map((item) => {
                        return { label: item, value: item };
                      })}
                    />
                  )}
                />
              </Form.Item>
            </Col>
          )}

          <Col span={8}>
            <Form.Item label="Last Entered Taka No." wrapperCol={{ sm: 24 }}>
              <Row gutter={15}>
                <Col span={8}>
                  <Controller
                    control={control}
                    name="last_taka_no"
                    render={({ field }) => <Input {...field} disabled />}
                  />
                </Col>
                <Col span={10}>
                  <Controller
                    control={control}
                    name="last_taka_no_date"
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        disabled
                        style={{ width: "100%" }}
                      />
                    )}
                  />
                </Col>
              </Row>
            </Form.Item>
          </Col>
        </Row>

        {machine_name !== undefined && machine_name !== null && (
          <AddProductionTable
            errors={errors}
            control={control}
            setFocus={setFocus}
            activeField={activeField}
            setActiveField={setActiveField}
            getValues={getValues}
            setValue={setValue}
            setError={setError}
            trigger={trigger}
            lastProductionTaka={lastProductionTaka}
            beamCardList={beamCardList}
            production_filter={production_filter}
            avgWeight={avgWeight}
            weightPlaceholder={weightPlaceholder}
            setWeightPlaceholder={setWeightPlaceholder}
            dropDownQualityListRes={dropDownQualityListRes}
          />
        )}

        {production_filter === "machine_wise" && (
          <Row style={{ gap: "12px", marginTop: "20px" }}>
            <Col span={3}>
              <Form.Item
                label="Pis"
                name={`pis`}
                validateStatus={errors.pis ? "error" : ""}
                help={errors.pis && errors.pis.message}
                required={true}
                wrapperCol={{ sm: 24 }}
                style={{
                  marginBottom: "0px",
                  border: "0px solid !important",
                }}
              >
                <Controller
                  control={control}
                  name={`pis`}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder="pis"
                      onChange={(e) => field.onChange(+e.target.value)}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="GRADE"
                name={`grade`}
                validateStatus={errors.grade ? "error" : ""}
                help={errors.grade && errors.grade.message}
                required={true}
                wrapperCol={{ sm: 24 }}
                style={{
                  marginBottom: "0px",
                  border: "0px solid !important",
                }}
              >
                <Controller
                  control={control}
                  name={`grade`}
                  render={({ field }) => (
                    <Radio.Group {...field} name="grade">
                      <Radio value={"A"}>A</Radio>
                      <Radio value={"B"}>B</Radio>
                      <Radio value={"C"}>C</Radio>
                      <Radio value={"D"}>D</Radio>
                    </Radio.Group>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={() => reset()}>
            Reset
          </Button>
          <Button
            type="primary"
            htmlType="button"
            onClick={handleSubmit(onSubmit)}
            loading={isPending}
          >
            Create
          </Button>
        </Flex>
      </div>
    </Form>
  );
};

export default AddProduction;
