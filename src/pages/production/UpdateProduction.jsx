import { useContext, useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Row,
  Col,
  Flex,
  Divider,
  message,
  Typography,
  Table,
  DatePicker,
  Tag,
  Alert
} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GlobalContext } from "../../contexts/GlobalContext";
import { Controller, useForm } from "react-hook-form";
import { getInHouseQualityListRequest } from "../../api/requests/qualityMaster";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  getProductionByIdRequest,
  updateProductionReportRequest,
  updateProductionRequest,
} from "../../api/requests/production/inhouseProduction";
import { getBeamCardListRequest } from "../../api/requests/beamCard";
import { inhouseProductionDetailsRequest } from "../../api/requests/production/inhouseProduction";
import { getEmployeeListRequest } from "../../api/requests/users";
import moment from "moment";
import dayjs from "dayjs";
import { getDisplayQualityName } from "../../constants/nameHandler";

const updateProductionSchema = yupResolver(
  yup.object().shape({
    quality_id: yup.string().required("Please select quality."),
    company: yup.string().required("Please select company."),
    taka_no: yup.string().required("Please enter taka no."),
    meter: yup.string().required("Please enter meter."),
    weight: yup.string().required("Please enter weight."),
    machine_no: yup.string().required("Please select machine no."),
    average: yup.string().required("Please enter average."),
    beam_no: yup.string().required("Please enter beam no."),
  })
);

const UpdateProduction = () => {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { companyId, companyListRes } = useContext(GlobalContext);

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

  // Particular production taka average report information ====================
  const [foldingProductionTaka, setFoldingProductionTaka] = useState([]);
  const { data: foldingProductionTakaDetails, refetch } = useQuery({
    queryKey: ["production", "folding", "list"],
    queryFn: async () => {
      let params = {
        company_id: companyId,
        production_taka_id: productionDetail?.id,
      };
      let res = await inhouseProductionDetailsRequest({ params });
      return res?.data?.data; // Return the response to store it in `productionDetails`
    },
    enabled: Boolean(companyId), // Enable query based on companyId presence
  });

  useEffect(() => {
    if (foldingProductionTakaDetails) {
      setFoldingProductionTaka(foldingProductionTakaDetails?.folding_details)
    }
  }, [foldingProductionTakaDetails]);

  // Day handler handler ================ 
  const InputChangeHandler = (event, index) => {
    setFoldingProductionTaka((prevTaka) =>
      prevTaka?.map((element, takaIndex) =>
        takaIndex === index
          ? { ...element, createdAt: dayjs(event).format("YYYY-MM-DD") }
          : element
      )
    );
  };

  // Employee change handler ===============
  const EmployeeChangeHandler = (event, index) => {
    setFoldingProductionTaka((prevTaka) =>
      prevTaka?.map((element, takaIndex) =>
        takaIndex === index
          ? { ...element, user_id: event }
          : element
      )
    );
  }

  // Shift change handler =========================
  const ShiftChangeHandler = (event, index) => {
    setFoldingProductionTaka((prevTaka) =>
      prevTaka?.map((element, takaIndex) =>
        takaIndex === index
          ? { ...element, shift: event }
          : element
      )
    );
  }

  // Meter change handler ==========================
  const MeterChangeHandler = (event, index) => {
    setFoldingProductionTaka((prevTaka) =>
      prevTaka?.map((element, takaIndex) =>
        takaIndex === index
          ? {
            ...element,
            [foldingProductionTaka[0]?.user?.employer?.shift === "day"
              ? "day_meter"
              : "night_meter"]: event.target.value,
          }
          : element
      )
    );
  }

  // Get Employee user list =================================================== 
  const { data: employeeListRes, isLoading: isLoadingEmployeeList } = useQuery({
    queryKey: [
      "employee/list",
      {
        company_id: companyId,
      },
    ],
    queryFn: async () => {
      const res = await getEmployeeListRequest({
        params: {
          company_id: companyId,
          salary_type: 'Work basis'
        },
      });
      return res.data?.data?.empoloyeeList;
    },
    enabled: Boolean(companyId),
  });


  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      render: (text, record, index) => {
        return (
          <div>
            {index + 1}
          </div>
        )
      }
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (value, record, index) => {
        return (
          <div>
            <DatePicker
              disabled={record?.is_paid ? true : false}
              value={dayjs(record?.createdAt)}
              defaultChecked={record?.createdAt}
              disabledDate={disabledFutureDate}
              onChange={(event) => {
                InputChangeHandler(event, index)
              }}
            />
          </div>
        )
      }
    },
    {
      title: "Employee name",
      dataIndex: "employeeName",
      key: "employeeName",
      render: (value, record, index) => {
        return (
          <Select
            disabled={record?.is_paid ? true : false}
            value={record?.user?.id} style={{ width: "100%" }} placeholder="Select Employee"
            onChange={(event) => {
              EmployeeChangeHandler(event, index)
            }}
            options={employeeListRes?.rows?.map(
              ({ id = 0, first_name = "" }) => ({
                label: first_name,
                value: id,
              })
            )}>
          </Select>
        )
      }
    },
    {
      title: "Taka no",
      dataIndex: "takaNo",
      key: "takaNo",
      render: (text, record) => {
        return (
          <div>
            {record?.taka_no || "-"}
          </div>
        )
      }
    },
    {
      title: "Meter",
      dataIndex: "meter",
      key: "meter",
      render: (value, record, index) => {
        return (
          <>
            <Flex>
              <Input style={{ width: "100%", marginTop: 4 }}
                placeholder="Meter"
                readOnly={record?.is_paid ? true : false}
                defaultValue={value}
                value={record?.night_meter == 0 ? record?.day_meter : record?.night_meter}
                onChange={(event) => {
                  MeterChangeHandler(event, index)
                }}
              />
            </Flex>
          </>
        )
      }
    },
    {
      title: "Machine no",
      dataIndex: "machineNo",
      render: (text, record) => {
        return (
          <div>
            {record?.machine_no}
          </div>
        )
      }
    },
    {
      title: "Beam no",
      dataIndex: "beamNo",
      key: "beamNo",
      render: (text, record) => {
        return (
          <div>
            {productionDetail?.beam_no}
          </div>
        )
      }
    },
    {
      title: "Paid Status",
      dataIndex: "is_paid",
      key: "is_paid",
      render: (text, record) => {
        return (
          <div>
            <Tag color={record?.is_paid ? "green" : "red"}>
              {record?.is_paid ? "Paid" : "Un-Paid"}
            </Tag>
          </div>
        )
      }
    },
  ];

  // Particular production details related information ====================
  const { data: productionDetail } = useQuery({
    queryKey: ["productionDetail", "get", id, { company_id: companyId }],
    queryFn: async () => {
      const res = await getProductionByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  // Update Production details related information =============================
  const { mutateAsync: updateProduction, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await updateProductionRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["production", "update"],
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
    const newData = {
      quality_id: +data.quality_id,
      meter: +data.meter,
      weight: +data.weight,
      machine_no: +data.machine_no,
      beam_no: data.beam_no,
      average: +data.average,
      beam_load_id: productionDetail.beam_load_id,
      pending_meter: +productionDetail.pending_meter,
    };

    console.log("Payload information");
    console.log(newData);



    // await updateProduction(newData);
  };

  // Update production average report related handler =========================
  const { mutateAsync: updateProductionReport, isPending: isReportPending } = useMutation({
    mutationFn: async (data) => {
      const res = await updateProductionReportRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["production", "update"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["production", "list", companyId]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success("Production report updated successfully");
      }
      navigate(-1);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const UpdateReport = async () => {
    let requestPayload = [];
    foldingProductionTaka?.map((element) => {
      requestPayload.push({
        "id": element?.id,
        "user_id": +element?.user_id,
        "createdAt": element?.createdAt,
        "day_meter": +element?.day_meter,
        "night_meter": +element?.night_meter
      })
    })
    await updateProductionReport(requestPayload)

  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
    trigger,
  } = useForm({
    defaultValues: {
      quality_id: null,
      company: "",
      taka_no: "",
      meter: "",
      weight: "",
      machine_no: null,
      average: "",
      beam_no: "",
    },
    resolver: updateProductionSchema,
  });

  const { quality_id, meter } = watch();

  // DropDown quality list request =================================
  const { data: dropDownQualityListRes, isLoading: dropDownQualityLoading } =
    useQuery({
      queryKey: [
        "dropDownQualityListRes",
        "list",
        {
          company_id: companyId,
          //   machine_name: machine_name,
          page: 0,
          pageSize: 99999,
          is_active: 1,
        },
      ],
      queryFn: async () => {
        // if (machine_name) {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
            //   machine_name: machine_name,
            page: 0,
            pageSize: 99999,
            is_active: 1,
          },
        });
        return res.data?.data;
        // } else {
        //   return { row: [] };
        // }
      },
      enabled: Boolean(companyId),
    });

  // Machinenumber dropdown list information ===========================
  const { data: beamCardList, isLoading: isBeamCardListLoading } = useQuery({
    queryKey: [
      "beamCard",
      "list",
      {
        company_id: companyId,
        quality_id: quality_id,
      },
    ],
    queryFn: async () => {
      const res = await getBeamCardListRequest({
        params: {
          company_id: companyId,
          page: 0,
          pageSize: 99999,
          quality_id: quality_id,
          status: "running"
        }
      });

      return res?.data?.data;
    },
    enabled: Boolean(companyId && quality_id)
  })


  useEffect(() => {
    if (productionDetail?.id !== undefined) {
      refetch();
    }
  }, [companyId, productionDetail])


  const [machineListDropDown, setMachineListDropDown] = useState([]);
  const [changedBeamNumber, setChangedBeamNumber] = useState(null);
  const [changedPendingMeter, setChangedPendigMeter] = useState(null);

  useEffect(() => {
    let temp = [];
    beamCardList?.rows?.map((element) => {

      const obj =
        element?.non_pasarela_beam_detail ||
        element?.recieve_size_beam_detail ||
        element?.job_beam_receive_detail;

      temp.push({
        label: element?.machine_no,
        value: element?.machine_no,
        beam_no: obj?.beam_no,
        pending_meter: obj?.pending_meter
      })
    })
    setMachineListDropDown(temp);
  }, [beamCardList]);

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

  const weightPlaceholder = useMemo(() => {
    if (avgWeight) {
      const weightFrom = ((avgWeight.weight_from / 100) * meter).toFixed(3);
      const weightTo = ((avgWeight.weight_to / 100) * meter).toFixed(3);

      return {
        weightFrom: +weightFrom,
        weightTo: +weightTo,
      };
    }
  }, [avgWeight, meter]);

  const handleWeightChange = (value, field) => {
    if (
      +value >= weightPlaceholder.weightFrom &&
      +value <= weightPlaceholder.weightTo
    ) {
      trigger(`weight`);
    } else {
      setError(`weight`, {
        type: "custom",
        message: "wrong weight",
      });
    }
    field.onChange(value ? value : "");
  };

  useEffect(() => {
    if (productionDetail) {
      const {
        quality_id,
        company_id,
        taka_no,
        weight,
        meter,
        average,
        beam_no,
        machine_no,
      } = productionDetail;

      reset({
        quality_id,
        company: company_id,
        taka_no,
        weight,
        meter,
        beam_no,
        average,
        machine_no,
      });
    }
  }, [productionDetail, reset]);


  return (
    <Form
      form={form}
      layout="vertical"
      style={{ marginTop: "1rem" }}
      onFinish={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          
          {/* Edit production title  */}
          <Flex>
            <div className="flex items-center gap-5">
              <Button onClick={() => navigate(-1)}>
                <ArrowLeftOutlined />
              </Button>
              <h3 className="m-0 text-primary">Edit Productions</h3>
            </div>
          </Flex>

          {/* Taka information edit related functionality ` */}

          <Flex gap={5} style={{justifyContent: "flex-start"}}>
            <div style={{ marginTop: "auto", marginBottom: "auto" }}>
              <Alert
                type="warning"
                message={
                  <>
                    <span style={{ fontWeight: 'bold', color: 'black' }}>This Taka is been </span>
                    <strong>Sold</strong> or in <strong>Re-work</strong>.
                    <span> You can not Edit Taka details!</span>
                  </>
                }
                style={{ color: '#8a6d3b', borderColor: '#f1c40f' }}
              />
            </div>
          </Flex>
        </div>


        <Row className="w-100" justify={"flex-start"} style={{ gap: "12px" }}>
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
                            label: getDisplayQualityName(item),
                          }))
                        }
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    </>
                  );
                }}
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
                render={({ field }) => {
                  return (
                    <>
                      <Select
                        {...field}
                        placeholder="Select Company"
                        options={companyListRes?.rows?.map(
                          ({ company_name = "", id = "" }) => ({
                            label: company_name,
                            value: id,
                          })
                        )}
                        disabled
                      />
                    </>
                  );
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{
          marginTop: -10,
          marginBottom: 0
        }} />

        <Row style={{ gap: "16px" }} className="w-100" justify={"start"}>
          <Col span={6}>
            <Form.Item
              label="Taka No"
              name="taka_no"
              validateStatus={errors.taka_no ? "error" : ""}
              help={errors.taka_no && errors.taka_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="taka_no"
                render={({ field }) => (
                  <Input
                    {...field}
                    name="taka_no"
                    style={{
                      width: "100%",
                    }}
                    disabled
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Meter"
              name="meter"
              validateStatus={errors.meter ? "error" : ""}
              help={errors.meter && errors.meter.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="meter"
                render={({ field }) => (
                  <Input
                    {...field}
                    name="meter"
                    style={{
                      width: "100%",
                    }}
                    inputMode="decimal"
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      // calculateWeight(+e.target.value);
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Weight"
              name="weight"
              validateStatus={errors.weight ? "error" : ""}
              help={errors.weight && errors.weight.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="weight"
                render={({ field }) => (
                  <Input
                    {...field}
                    name="weight"
                    style={{
                      width: "100%",
                    }}
                    placeholder={weightPlaceholder?.weightFrom || ""}
                    onChange={(e) => {
                      handleWeightChange(e.target.value, field);
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={5}>
            <Form.Item
              label="Machine No"
              name="machine_no"
              validateStatus={errors.machine_no ? "error" : ""}
              help={errors.machine_no && errors.machine_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="machine_no"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Machine number"
                    loading={isBeamCardListLoading}
                    options={machineListDropDown}
                    onChange={(value, details) => {
                      field.onChange(value);
                      setChangedBeamNumber(details?.beam_no);
                      setChangedPendigMeter(details?.pending_meter);
                      // handleQualityChange();
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row style={{ gap: "16px", marginTop: "-10px" }} className="w-100" justify={"start"}>
          <Col span={6}>
            <Form.Item
              label="Average"
              name="average"
              validateStatus={errors.average ? "error" : ""}
              help={errors.average && errors.average.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="average"
                render={({ field }) => (
                  <Input
                    {...field}
                    name="average"
                    style={{
                      width: "100%",
                    }}
                    disabled
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Beam No"
              name="beam_no"
              validateStatus={errors.beam_no ? "error" : ""}
              help={errors.beam_no && errors.beam_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="beam_no"
                render={({ field }) => (
                  <>
                    <Input
                      {...field}
                      name="beam_no"
                      style={{
                        width: "100%",
                      }}
                      disabled
                    />
                    <div style={{ marginTop: "6px" }}>
                      {changedBeamNumber !== null && <span style={{
                        fontWeight: 600,
                        color: "green"
                      }}>Beam No. Found {changedBeamNumber}</span>}
                    </div>
                  </>
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        {quality_id && (
          <Typography.Text style={{ color: "red", marginTop: -20 }}>
            Avg must be between {avgWeight?.weight_from} to{" "}
            {avgWeight?.weight_to}
          </Typography.Text>
        )}

        <Flex gap={10} justify="flex-end">
          <Button type="primary" htmlType="submit" loading={isPending}>
            Update Production Taka
          </Button>
        </Flex>

        {/* ========== Particular employee average report related information ============  */}
        <div style={{
          marginTop: -40
        }}>
          <h2 style={{
            textAlign: "left"
          }}>Employee Average Report
            {foldingProductionTaka && foldingProductionTaka?.length > 0 && (
              <span
                style={{
                  color: "blue",
                  paddingLeft: 10
                }}>
                { foldingProductionTaka && 
                  foldingProductionTaka[0]?.user?.employer?.shift == "day" ? "Day Shift" : "Night Shift"}
              </span>
            )}
          </h2>

          <Table
            columns={columns}
            dataSource={foldingProductionTaka || []}
            pagination={false}
          />
        </div>

        {foldingProductionTakaDetails?.folding_details?.length > 0 && (
          <Flex gap={10} justify="flex-end">
            <Button type="primary" loading={isReportPending} onClick={UpdateReport}>
              Update Report
            </Button>
          </Flex>
        )}


      </div>
    </Form>
  );
};

export default UpdateProduction;
