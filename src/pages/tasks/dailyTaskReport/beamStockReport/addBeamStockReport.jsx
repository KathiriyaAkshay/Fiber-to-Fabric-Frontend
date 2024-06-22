import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
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
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
// import { useCurrentUser } from "../../../../api/hooks/auth";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import dayjs from "dayjs";
import {
  createBeamStockReportRequest,
  getLastBeamNumberRequest,
  getNonPasarelaBeamRequest,
} from "../../../../api/requests/reports/beamStockReport";
import { getEmployeeListRequest } from "../../../../api/requests/users";

const addJobTakaSchemaResolver = yupResolver(
  yup.object().shape({
    machine_name: yup.string().required("Please select machine name."),
    quality_id: yup.string().required("Please select quality id."),
    quality_group: yup.string().required("Please select quality group."),
    beam_type: yup.string().required("Please select beam type."),
  })
);

const AddBeamStockReport = () => {
  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const [fieldArray, setFieldArray] = useState([]);
  const { companyId } = useContext(GlobalContext);

  const [dateValue, setDateValue] = useState(dayjs());
  const [timeValue, setTimeValue] = useState(dayjs());

  const [existingTars, setExistingTars] = useState();
  const [existingPano, setExistingPano] = useState();

  function goBack() {
    navigate(-1);
  }

  const { mutateAsync: addBeamStockReport, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await createBeamStockReportRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["beamStock", "report", "add"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["beamStock", "report", "list"]);
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
    const newData = {
      machine_name: data.machine_name,
      quality_id: +data.quality_id,
      employee_id: data.employee,
      beam_type: data.beam_type,
      quality_group: data.quality_group,
    };
    if (data.quality_group === "job") {
      newData.beam_details = fieldArray.map((fieldNumber) => {
        return {
          beam_no: `IJBN-${data[`beam_no_${fieldNumber}`]}`,
          ends_or_tars: +data[`taar_${fieldNumber}`],
          meters: +data[`meter_${fieldNumber}`],
          pano: +data[`pano_${fieldNumber}`],
          taka: +data[`taka_${fieldNumber}`],
        };
      });
    } else {
      newData.beam_details = fieldArray.map((fieldNumber) => {
        return {
          beam_no: `BN-${data[`beam_no_${fieldNumber}`]}`,
          ends_or_tars: +data[`taar_${fieldNumber}`],
          meters: +data[`meter_${fieldNumber}`],
          pano: +data[`pano_${fieldNumber}`],
          taka: +data[`taka_${fieldNumber}`],
        };
      });
    }
    await addBeamStockReport(newData);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    resetField,
    watch,
    getValues,
    clearErrors,
    setError,
    setValue,
  } = useForm({
    defaultValues: {
      machine_name: null,
      quality_group: "inhouse(gray)",
      quality_id: null,
      beam_type: null,
    },
    resolver: addJobTakaSchemaResolver,
  });
  const { machine_name, quality_group, quality_id, beam_type } = watch();
  // ------------------------------------------------------------------------------------------

  const { data: nonPasarelaList } = useQuery({
    queryKey: [
      "nonPasarela",
      "list",
      { company_id: companyId, quality_id, beam_type },
    ],
    queryFn: async () => {
      if (beam_type === "pasarela (primary)" && quality_id) {
        const res = await getNonPasarelaBeamRequest({
          companyId,
          params: { company_id: companyId, quality_id },
        });
        return res.data?.data?.empoloyeeList;
      }
    },
    enabled: Boolean(companyId),
    initialData: { rows: [] },
  });
  console.log({ nonPasarelaList });

  const { data: employeeList, isLoading: isLoadingEmployeeData } = useQuery({
    queryKey: ["employee", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getEmployeeListRequest({
        companyId,
        params: { company_id: companyId },
      });
      return res.data?.data?.empoloyeeList;
    },
    enabled: Boolean(companyId),
    initialData: { rows: [], count: 0 },
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

  const { data: dropDownQualityListRes, dropDownQualityLoading } = useQuery({
    queryKey: [
      "dropDownQualityListRes",
      "list",
      {
        company_id: companyId,
        machine_name: machine_name,
        type: quality_group,
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
            type: quality_group,
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

  const { data: lastBeamNumber } = useQuery({
    queryKey: [
      "lastBeam",
      "Number",
      { company_id: companyId, type: quality_group },
    ],
    queryFn: async () => {
      if (quality_group === "inhouse(gray)") {
        const res = await getLastBeamNumberRequest({
          params: { company_id: companyId, type: quality_group },
        });
        return res.data?.data || 0;
      }
    },
    enabled: Boolean(companyId),
  });

  const resetAllFields = () => {
    fieldArray.forEach((field) => {
      resetField(`beam_no_${field}`);
      resetField(`taar_${field}`);
      resetField(`pano_${field}`);
      resetField(`taka_${field}`);
      resetField(`meter_${field}`);
    });
    setFieldArray([]);
  };

  const addNewFieldRow = (indexValue) => {
    let isValid = true;
    if (!fieldArray.length && indexValue === -1) {
      const nextValue = indexValue + 1;
      setFieldArray((prev) => {
        return [...prev, nextValue];
      });
      if (quality_group === "inhouse(gray)") {
        setValue(`beam_no_${nextValue}`, lastBeamNumber + (nextValue + 1));
        setValue(`taar_${nextValue}`, existingTars);
        setValue(`pano_${nextValue}`, existingPano);
      }
      return;
    }

    // fieldArray.forEach((item) => {
    clearErrors(`beam_no_${indexValue}`);
    clearErrors(`taar_${indexValue}`);
    clearErrors(`pano_${indexValue}`);
    clearErrors(`taka_${indexValue}`);
    clearErrors(`meter_${indexValue}`);
    // });

    // fieldArray.forEach((item) => {
    // if (item === indexValue) {
    // if (!getValues(`beam_no_${indexValue}`)) {
    //   setError(`beam_no_${indexValue}`, {
    //     type: "manual",
    //     message: "Required",
    //   });
    //   isValid = false;
    // }
    if (!getValues(`taar_${indexValue}`)) {
      setError(`taar_${indexValue}`, {
        type: "manual",
        message: "Required",
      });
      isValid = false;
    }
    if (!getValues(`pano_${indexValue}`)) {
      setError(`pano_${indexValue}`, {
        type: "manual",
        message: "Required",
      });
      isValid = false;
    }
    if (!getValues(`taka_${indexValue}`)) {
      setError(`taka_${indexValue}`, {
        type: "manual",
        message: "Required",
      });
      isValid = false;
    }
    if (!getValues(`meter_${indexValue}`)) {
      setError(`meter_${indexValue}`, {
        type: "manual",
        message: "Required",
      });
      isValid = false;
    }
    // }
    // });

    if (isValid) {
      const nextValue = fieldArray[fieldArray.length - 1] + 1;
      setFieldArray((prev) => {
        return [...prev, nextValue];
      });
      if (quality_group === "inhouse(gray)") {
        setValue(`beam_no_${nextValue}`, lastBeamNumber + (nextValue + 1));
        setValue(`taar_${nextValue}`, existingTars);
        setValue(`pano_${nextValue}`, existingPano);
      }
    }
  };

  const deleteFieldRow = (field) => {
    const newFields = [...fieldArray];
    const actualIndex = newFields.indexOf(field);
    newFields.splice(actualIndex, 1);
    setFieldArray(newFields);
  };

  useEffect(() => {
    if (quality_id) {
      const selectedQuality = dropDownQualityListRes.rows.find(
        ({ id }) => id === quality_id
      );
      setExistingTars(selectedQuality.inhouse_waraping_details[0].tars);
      setExistingPano(selectedQuality.inhouse_weft_details[0].pano);
    }
  }, [quality_id, dropDownQualityListRes]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <Button onClick={goBack}>
            <ArrowLeftOutlined />
          </Button>
          <h3 className="m-0 text-primary">Add New Beam Stock Report</h3>
        </div>
        <div className="flex items-center gap-5">
          {beam_type === "non-pasarela (primary)" &&
            quality_group === "inhouse(gray)" &&
            quality_id &&
            machine_name && (
              <Flex align="center" gap={10}>
                <Typography.Text style={{ whiteSpace: "nowrap" }}>
                  Last beam no
                </Typography.Text>
                <Input value={lastBeamNumber || 0} disabled />
              </Flex>
            )}
          <DatePicker
            value={dateValue}
            onChange={setDateValue}
            format={"DD-MM-YYYY"}
          />
          <TimePicker
            value={timeValue}
            onChange={setTimeValue}
            format={"HH:mm:ss"}
            disabled
          />
        </div>
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
              name={`machine_name`}
              validateStatus={errors[`machine_name`] ? "error" : ""}
              help={errors[`machine_name`] && errors[`machine_name`].message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name={`machine_name`}
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
                    allowClear
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Quality Group"
              name={`quality_group`}
              validateStatus={errors.quality_group ? "error" : ""}
              help={errors.quality_group && errors.quality_group.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="quality_group"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      placeholder="Select Quality Group"
                      options={[
                        { label: "Inhouse (Gray)", value: "inhouse(gray)" },
                        { label: "Job", value: "job" },
                      ]}
                      onChange={(value) => {
                        field.onChange(value);
                        resetField("quality_id");
                        resetAllFields();
                      }}
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Select Quality"
              name={`quality_id`}
              validateStatus={errors[`quality_id`] ? "error" : ""}
              help={errors[`quality_id`] && errors[`quality_id`].message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name={`quality_id`}
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
                      onChange={(value) => {
                        field.onChange(value);
                        beam_type === "non-pasarela (primary)" &&
                          addNewFieldRow(-1);
                      }}
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Beam Type"
              name={`beam_type`}
              validateStatus={errors.beam_type ? "error" : ""}
              help={errors.beam_type && errors.beam_type.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="beam_type"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      placeholder="Select Beam type"
                      options={[
                        {
                          label: "Pasarela (Primary)",
                          value: "pasarela (primary)",
                        },
                        {
                          label: "Non-Pasarela (Primary)",
                          value: "non-pasarela (primary)",
                        },
                      ]}
                      onChange={(value) => {
                        field.onChange(value);
                        value === "non-pasarela (primary)" &&
                          addNewFieldRow(-1);
                      }}
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Select Employee"
              name={`employee`}
              validateStatus={errors.employee ? "error" : ""}
              help={errors.employee && errors.employee.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="employee"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      placeholder="Select Employee"
                      loading={isLoadingEmployeeData}
                      options={employeeList.rows.map(
                        ({ first_name, last_name, id }) => {
                          return {
                            label: `${first_name} ${last_name}`,
                            value: id,
                          };
                        }
                      )}
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        {beam_type === "non-pasarela (primary)" &&
          quality_id &&
          machine_name &&
          fieldArray.map((fieldNumber, index) => {
            return (
              <FormRow
                key={index + "_form_row"}
                index={index}
                errors={errors}
                control={control}
                fieldNumber={fieldNumber}
                addNewFieldRow={addNewFieldRow}
                deleteFieldRow={deleteFieldRow}
                fieldArray={fieldArray}
                setValue={setValue}
                lastBeamNumber={lastBeamNumber}
                quality_group={quality_group}
              />
            );
          })}

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

export default AddBeamStockReport;

const FormRow = ({
  index,
  errors,
  control,
  fieldNumber,
  addNewFieldRow,
  deleteFieldRow,
  fieldArray,
  quality_group,
}) => {
  return (
    <>
      <Row
        key={index + "_add_beam_receive"}
        gutter={18}
        style={{
          padding: "12px",
        }}
      >
        <Col span={4}>
          <Form.Item
            label="Beam No"
            name={`beam_no_${fieldNumber}`}
            validateStatus={errors[`beam_no_${fieldNumber}`] ? "error" : ""}
            help={
              errors[`beam_no_${fieldNumber}`] &&
              errors[`beam_no_${fieldNumber}`].message
            }
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name={`beam_no_${fieldNumber}`}
              render={({ field }) => (
                <Flex gap={8}>
                  <Input
                    {...field}
                    value={quality_group === "job" ? "IJBN" : "BN"}
                    disabled
                  />
                  <Input
                    {...field}
                    placeholder="0"
                    style={{ width: "480px" }}
                  />
                </Flex>
              )}
            />
          </Form.Item>
        </Col>

        <Col span={3}>
          <Form.Item
            label="Taar/Ends"
            name={`taar_${fieldNumber}`}
            validateStatus={errors[`taar_${fieldNumber}`] ? "error" : ""}
            help={
              errors[`taar_${fieldNumber}`] &&
              errors[`taar_${fieldNumber}`].message
            }
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name={`taar_${fieldNumber}`}
              render={({ field }) => (
                <Input {...field} type="number" placeholder="0" />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={3}>
          <Form.Item
            label="Pano"
            name={`pano_${fieldNumber}`}
            validateStatus={errors[`pano_${fieldNumber}`] ? "error" : ""}
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
              render={({ field }) => <Input {...field} placeholder="0" />}
            />
          </Form.Item>
        </Col>

        <Col span={3}>
          <Form.Item
            label="Taka"
            name={`taka_${fieldNumber}`}
            validateStatus={errors[`taka_${fieldNumber}`] ? "error" : ""}
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
                <Input {...field} type="number" placeholder="0" />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={3}>
          <Form.Item
            label="Meter"
            name={`meter_${fieldNumber}`}
            validateStatus={errors[`meter_${fieldNumber}`] ? "error" : ""}
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
                <Input {...field} type="number" placeholder="0" />
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
              onClick={addNewFieldRow.bind(null, fieldNumber)}
              className="flex-none"
            />
          </Col>
        )}
      </Row>
    </>
  );
};
