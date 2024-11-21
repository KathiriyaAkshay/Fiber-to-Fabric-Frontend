import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  TimePicker,
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
import { getDropdownSupplierListRequest } from "../../../../api/requests/users";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import dayjs from "dayjs";
import {
  addJobBeamReceiveRequest,
  getLastJobBeamReceiveNoRequest,
} from "../../../../api/requests/job/receive/beamReceive";
import { disabledFutureDate } from "../../../../utils/date";

const addJobTakaSchemaResolver = yupResolver(
  yup.object().shape({
    machine_name: yup.string().required("Please select machine name."),
    quality_id: yup.string().required("Please select quality."),
    date: yup.string().required("Please enter date."),
    time: yup.string().required("Please enter time."),
    supplier_name: yup.string().required("Please select supplier name."),
    supplier_id: yup.string().required("Please select supplier company."),
    challan_beam_type: yup.string().required("Please select beam type."),
    challan_no: yup.string().required("Please select challan no."),
  })
);

const AddBeamReceive = () => {
  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const [fieldArray, setFieldArray] = useState([0]);
  const { companyId } = useContext(GlobalContext);

  function goBack() {
    navigate(-1);
  }

  // Create Beam receive handler ==========================================================

  const { mutateAsync: addNewBeamReceive, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await addJobBeamReceiveRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["beam", "receive", "add"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["jobTaka", "list", companyId]);
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
    let hasError = 0;

    fieldArray.forEach((item, index) => {
      if (!getValues(`supplier_beam_no_${index}`)) {
        setError(`supplier_beam_no_${index}`, {
          type: "manual",
          message: "Please, Provide Supplier beam number",
        });
        hasError = 1;
      }

      if (!getValues(`tars_${index}`)) {
        setError(`tars_${index}`, {
          type: "manual",
          message: "Please enter tars",
        });
        hasError = 1;
      }

      if (!getValues(`pano_${index}`)) {
        setError(`pano_${index}`, {
          type: "manual",
          message: "Please enter pano",
        });
        hasError = 1;
      }

      if (!getValues(`taka_${index}`)) {
        setError(`taka_${index}`, {
          type: "manual",
          message: "Please enter taka",
        });
        hasError = 1;
      }

      if (!getValues(`meter_${index}`)) {
        setError(`meter_${index}`, {
          type: "manual",
          message: "Please enter meter",
        });
        hasError = 1;
      }
    });

    if (hasError == 0) {
      const newData = {
        machine_name: data.machine_name,
        quality_id: +data.quality_id,
        supplier_id: +data.supplier_id,
        challan_beam_type: data.challan_beam_type,
        challan_no: data.challan_no,
        receive_date: dayjs(data.date).format("YYYY-MM-DD"),
        job_beam_details: fieldArray.map((field, index) => {
          return {
            beam_no: lastBeamNo
              ? challan_beam_type === "non pasarela (secondary)"
                ? "SJBN-" + (lastBeamNo + (index + 1))
                : "JBN-" + (lastBeamNo + (index + 1))
              : challan_beam_type === "non pasarela (secondary)"
                ? "SJBN-" + 1
                : "JBN-" + 1,
            supplier_beam_no: data[`supplier_beam_no_${field}`],
            tars: parseInt(data[`tars_${field}`]),
            pano: parseInt(data[`pano_${field}`]),
            taka: parseInt(data[`taka_${field}`]),
            meter: parseInt(data[`meter_${field}`]),
          };
        }),
      };
      await addNewBeamReceive(newData);
    }
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    getValues,
    clearErrors,
    setValue,
    setError,
  } = useForm({
    defaultValues: {
      machine_name: null,
      quality_id: null,
      supplier_name: null,
      supplier_id: null,
      challan_beam_type: null,
      challan_no: null,
      date: dayjs(),
      time: dayjs(),
    },
    resolver: addJobTakaSchemaResolver,
  });
  const { machine_name, supplier_name, challan_beam_type } = watch();
  console.table("🧑‍💻 || challan_beam_type:", challan_beam_type);

  // ------------------------------------------------------------------------------------------

  const { data: lastBeamNo } = useQuery({
    queryKey: [
      "last",
      "beamNo",
      { company_id: companyId, beam_type: challan_beam_type },
    ],
    queryFn: async () => {
      if (challan_beam_type) {
        let beam_type = null;
        let pasarela_beam_type = [
          "pasarela (primary)",
          "non pasarela (primary)",
        ];

        if (pasarela_beam_type.includes(challan_beam_type)) {
          beam_type = "pasarela (primary)";
        } else {
          beam_type = challan_beam_type;
        }

        const res = await getLastJobBeamReceiveNoRequest({
          companyId,
          params: { company_id: companyId, beam_type: beam_type },
        });
        if (res?.data?.data == null){
          return 0 ;
        } else {
          const regex = /-(\d+)/;
          const match = res?.data?.data.match(regex);
          const number = match ? parseInt(match[1], 10) : 0;
          return number;
        }
      }
    },
    placeholderData: keepPreviousData,
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

  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: ["dropdown/supplier/list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getDropdownSupplierListRequest({
        params: { company_id: companyId },
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
      const obj = dropdownSupplierListRes.filter((item) => {
        return item.supplier_name === supplier_name;
      })[0];

      return obj?.supplier_company?.map((item) => {
        return { label: item.supplier_company, value: item.supplier_id };
      });
    } else {
      return [];
    }
  }, [supplier_name, dropdownSupplierListRes]);

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

  const addNewFieldRow = (indexValue) => {
    let isValid = true;

    fieldArray.forEach((field) => {
      clearErrors(`supplier_beam_no_${field}`);
      clearErrors(`tars_${field}`);
      clearErrors(`pano_${field}`);
      clearErrors(`taka_${field}`);
      clearErrors(`meter_${field}`);
    });

    fieldArray.forEach((field) => {
      if (field === indexValue) {
        if (!getValues(`supplier_beam_no_${field}`)) {
          setError(`supplier_beam_no_${field}`, {
            type: "manual",
            message: "Please select supplier beam no",
          });
          isValid = false;
        }
        if (!getValues(`tars_${field}`)) {
          setError(`tars_${field}`, {
            type: "manual",
            message: "Please enter tars.",
          });
          isValid = false;
        }
        if (!getValues(`pano_${field}`)) {
          setError(`pano_${field}`, {
            type: "manual",
            message: "Please enter pano.",
          });
          isValid = false;
        }
        if (!getValues(`taka_${field}`)) {
          setError(`taka_${field}`, {
            type: "manual",
            message: "Please enter taka.",
          });
          isValid = false;
        }
        if (!getValues(`meter_${field}`)) {
          setError(`meter_${field}`, {
            type: "manual",
            message: "Please enter meter.",
          });
          isValid = false;
        }
      }
    });

    if (isValid) {
      const nextValue = fieldArray[fieldArray.length - 1] + 1;
      setFieldArray((prev) => {
        return [...prev, nextValue];
      });

      let beam_number = null;

      if (challan_beam_type == "non pasarela (secondary)") {
        beam_number = `SJBN-${Number(lastBeamNo) + (nextValue + 1)}`;
      } else {
        beam_number = `JBN-${Number(lastBeamNo) + (nextValue + 1)}`;
      }

      let previous_beam_tars = getValues(`tars_${nextValue - 1}`);
      let previous_beam_pano = getValues(`pano_${nextValue - 1}`);
      let previous_beam_taka = getValues(`taka_${nextValue - 1}`);
      let previous_beam_meter = getValues(`meter_${nextValue - 1}`);

      setValue(`tars_${nextValue}`, previous_beam_tars);
      setValue(`pano_${nextValue}`, previous_beam_pano);
      setValue(`taka_${nextValue}`, previous_beam_taka);
      setValue(`meter_${nextValue}`, previous_beam_meter);
      setValue(`beam_no_${nextValue}`, beam_number);
    }
  };

  const deleteFieldRow = (field) => {
    const newFields = [...fieldArray];
    const actualIndex = newFields.indexOf(field);
    newFields.splice(actualIndex, 1);
    setFieldArray(newFields);
  };

  return (
    <div className="flex flex-col p-4">
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <Button onClick={goBack}>
            <ArrowLeftOutlined />
          </Button>
          <h3 className="m-0 text-primary">Add New Beam Receive</h3>
        </div>
        <Form.Item name="fieldA" valuePropName="checked">
          <Checkbox defaultChecked />
          {"  "}
          Do you want to add these beams to your Beam Stock ?
        </Form.Item>
      </div>
      <Form
        layout="vertical"
        style={{ marginTop: "1rem" }}
        onFinish={handleSubmit(onSubmit)}
      >
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={4}>
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

          <Col span={4}>
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
                          label: item.quality_name,
                        }))
                      }
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Supplier Name"
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
                    loading={isLoadingDropdownSupplierList}
                    placeholder="Select Supplier"
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

          <Col span={4}>
            <Form.Item
              label="Supplier Company"
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
                    loading={isLoadingDropdownSupplierList}
                    placeholder="Select Supplier Company"
                    options={dropDownSupplierCompanyOption}
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

          <Col span={2}>
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
                    name="challan_no"
                    placeholder="Challan No"
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Beam Type"
              name="challan_beam_type"
              validateStatus={errors.challan_beam_type ? "error" : ""}
              help={
                errors.challan_beam_type && errors.challan_beam_type.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="challan_beam_type"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      placeholder="Select Beam Type"
                      options={[
                        {
                          label: "Pasarela (Primary)",
                          value: "pasarela (primary)",
                        },
                        {
                          label: "Non Pasarela (Primary)",
                          value: "non pasarela (primary)",
                        },
                        {
                          label: "Non Pasarela (Secondary)",
                          value: "non pasarela (secondary)",
                        },
                      ]}
                      style={{
                        textTransform: "capitalize",
                      }}
                      dropdownStyle={{
                        textTransform: "capitalize",
                      }}
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>

          <Col span={3}>
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
                    format={"DD-MM-YYYY"}
                    style={{ width: "100%" }}
                    disabledDate={disabledFutureDate}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item
              label="Time"
              name="time"
              validateStatus={errors.time ? "error" : ""}
              help={errors.time && errors.time.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="time"
                render={({ field }) => (
                  <TimePicker {...field} style={{ width: "100%" }} />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <div style={{marginTop: -20}}>
          {challan_beam_type != undefined &&
            fieldArray.map((fieldNumber, index) => {
              console.log(index);
              
              return (
                <Row
                  key={index + "_add_beam_receive"}
                  gutter={18}
                  style={{
                    padding: "12px",
                  }}
                >
                  <Col span={3}>
                    <Form.Item
                      label="Beam No"
                      name={`beam_no_${fieldNumber}`}
                      validateStatus={
                        errors[`beam_no_${fieldNumber}`] ? "error" : ""
                      }
                      help={
                        errors[`beam_no_${fieldNumber}`] &&
                        errors[`beam_no_${fieldNumber}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                    >
                      <Typography.Text style={{ fontWeight: "bold" }}>
                        {challan_beam_type === "non pasarela (secondary)"
                            ? "SJBN-" + (lastBeamNo + (index + 1))
                            : "JBN-" + (lastBeamNo + (index + 1))}
                      </Typography.Text>
                    </Form.Item>
                  </Col>

                  <Col span={3}>
                    <Form.Item
                      label="Supplier Beam No"
                      name={`supplier_beam_no_${fieldNumber}`}
                      validateStatus={
                        errors[`supplier_beam_no_${fieldNumber}`] ? "error" : ""
                      }
                      help={
                        errors[`supplier_beam_no_${fieldNumber}`] &&
                        errors[`supplier_beam_no_${fieldNumber}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                    >
                      <Controller
                        control={control}
                        name={`supplier_beam_no_${fieldNumber}`}
                        render={({ field }) => (
                          <Input {...field} placeholder="12" />
                        )}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={3}>
                    <Form.Item
                      label="Taar/Ends"
                      name={`tars_${fieldNumber}`}
                      validateStatus={
                        errors[`tars_${fieldNumber}`] ? "error" : ""
                      }
                      help={
                        errors[`tars_${fieldNumber}`] &&
                        errors[`tars_${fieldNumber}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                    >
                      <Controller
                        control={control}
                        name={`tars_${fieldNumber}`}
                        render={({ field }) => (
                          <Input {...field} placeholder="12" />
                        )}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Form.Item
                      label="Pano"
                      name={`pano_${fieldNumber}`}
                      validateStatus={
                        errors[`pano_${fieldNumber}`] ? "error" : ""
                      }
                      help={
                        errors[`pano_${fieldNumber}`] &&
                        errors[`pano_${fieldNumber}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                    >
                      <Controller
                        control={control}
                        name={`pano_${fieldNumber}`}
                        render={({ field }) => (
                          <Input {...field} placeholder="12" />
                        )}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={2}>
                    <Form.Item
                      label="Taka"
                      name={`taka_${fieldNumber}`}
                      validateStatus={
                        errors[`taka_${fieldNumber}`] ? "error" : ""
                      }
                      help={
                        errors[`taka_${fieldNumber}`] &&
                        errors[`taka_${fieldNumber}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                    >
                      <Controller
                        control={control}
                        name={`taka_${fieldNumber}`}
                        render={({ field }) => (
                          <Input {...field} placeholder="12" />
                        )}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={2}>
                    <Form.Item
                      label="Meter"
                      name={`meter_${fieldNumber}`}
                      validateStatus={
                        errors[`meter_${fieldNumber}`] ? "error" : ""
                      }
                      help={
                        errors[`meter_${fieldNumber}`] &&
                        errors[`meter_${fieldNumber}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                    >
                      <Controller
                        control={control}
                        name={`meter_${fieldNumber}`}
                        render={({ field }) => (
                          <Input {...field} placeholder="12" />
                        )}
                      />
                    </Form.Item>
                  </Col>

                  {fieldArray.length > 1 && (
                    <Col span={1}>
                      <Button
                        style={{ marginTop: "1.9rem" }}
                        icon={<DeleteOutlined />}
                        type="primary"
                        danger
                        onClick={deleteFieldRow.bind(null, fieldNumber)}
                        className="flex-none"
                      />
                    </Col>
                  )}

                  {index === fieldArray.length - 1 && (
                    <Col span={1}>
                      <Button
                        style={{ marginTop: "1.9rem" }}
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={addNewFieldRow.bind(null, index)}
                        className="flex-none"
                      />
                    </Col>
                  )}
                </Row>
              );
          })}
        </div>

        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Create
          </Button>
        </Flex>
      </Form>
    </div>
  );
};

export default AddBeamReceive;
