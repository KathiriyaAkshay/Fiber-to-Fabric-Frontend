import { ArrowLeftOutlined, EyeOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Flex,
  Form,
  Input,
  message,
  Select,
  Typography,
} from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { getEmployeeListRequest } from "../../../../api/requests/users";
import { mutationOnErrorHandler } from "../../../../utils/mutationUtils";
import { createWorkBasisSalaryRequest } from "../../../../api/requests/accounts/salary";
import { getInHouseProductionByTakaNo } from "../../../../api/requests/production/inhouseProduction";
import _ from "lodash";

const COLUMNS = [1, 2, 3, 4, 5];

const customStyle = {
  dateTitleStyle: {
    color: "var(--menu-item-hover-color)",
    fontSize: "22px",
    fontWeight: "600",
  },
};

const AddSalaryReport = () => {
  // const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { companyId } = useContext(GlobalContext);

  function goBack() {
    navigate(-1);
  }

  // Generate an array of dates for the current month
  const datesInMonth = useMemo(() => {
    const currentMonth = new Date().getMonth(); // Get current month (0-based index)
    const currentYear = new Date().getFullYear(); // Get current year

    // Calculate the first and last dates of the current month
    // const startDate = new Date(currentYear, currentMonth, 1); // 1st day of the month
    const lastDate = new Date(currentYear, currentMonth + 1, 0); // Last day of the month

    return Array.from(
      { length: lastDate.getDate() }, // Length based on the last day
      (_, index) => new Date(currentYear, currentMonth, index + 1) // Create each date
    );
  }, []);

  const { mutateAsync: createWorkBasisSalary, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await createWorkBasisSalaryRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "work-basis", "salary"],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      mutationOnErrorHandler({ error });
    },
  });

  const onSubmit = async (data) => {
    const payload = [];

    Array.from({ length: datesInMonth.length }).forEach((_, index) => {
      const date = dayjs(datesInMonth[index]).format("YYYY-MM-DD");
      const taka_no = data[`taka_no_${index}`] || 0;
      const machine_name = data[`machine_name_${index}`] || 0;
      const m_no = data[`m_no_${index}`] || 0;
      // const b_no = data[`b_no_${index}`] || 0;
      const inhouse_production_id = data[`inhouse_production_id_${index}`] || 0;
      const quality_id = data[`quality_id_${index}`] || 0;
      const beam_load_id = data[`beam_load_id_${index}`] || 0;

      if (date && taka_no && machine_name) {
        COLUMNS.forEach((col) => {
          const day_meter = +getValues(`day_meter_${index}_${col}`) || 0;
          const user_id = +getValues(`employee_${col}`) || 0;

          if (user_id && day_meter) {
            const object = {
              createdAt: date,
              taka_no,
              machine_name,
              machine_no: m_no,
              inhouse_production_id,
              beam_load_id,
              quality_id,
              day_meter,
              user_id,
            };

            payload.push(object);
          }
        });
      }
    });

    await createWorkBasisSalary(payload);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    setError,
    clearErrors,
    watch,
  } = useForm({
    defaultValues: {},
  });

  const { employee_1, employee_2, employee_3, employee_4, employee_5 } =
    watch();

  // Load machine name dropdown list
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
        },
      });
      return res.data?.data?.empoloyeeList;
    },
    enabled: Boolean(companyId),
  });

  const employeeListOption = useMemo(() => {
    if (employeeListRes && employeeListRes?.rows.length) {
      return employeeListRes?.rows?.map(
        ({ id = 0, first_name = "", last_name = "", username = "" }) => ({
          label: `${first_name} ${last_name} | ( ${username} )`,
          value: id,
        })
      );
    } else {
      return [];
    }
  }, [employeeListRes]);

  const handleKeyDown = async (e, index) => {
    try {
      if (e.key === "Enter") {
        const machineName = getValues(`machine_name_${index}`);
        if (_.isNull(machineName) || _.isEmpty(machineName)) {
          setError(`machine_name_${index}`, {
            type: "manual",
            message: "Machine name is required.",
          });
          message.error("Please, Select Machine Name First!");
          return;
        } else {
          clearErrors(`machine_name_${index}`);
        }
        const takaNo = e.target.value;
        const params = { company_id: companyId };
        const response = await getInHouseProductionByTakaNo({ takaNo, params });
        if (response.data.success) {
          const data = response.data.data;
          setValue(`m_no_${index}`, data.machine_no);
          setValue(`b_no_${index}`, data.beam_no);
          // setValue(`coming_meter_${index}`, data.beam_no);
          setValue(`actual_meter_${index}`, data.meter);
          setValue(`inhouse_production_id_${index}`, data.id);
          setValue(`beam_load_id_${index}`, data.loaded_beam.id);
          setValue(`quality_id_${index}`, data.inhouse_quality.id);
        }
      }
    } catch (error) {
      mutationOnErrorHandler({ error });
    }
  };

  const calculateComingMeter = (row) => {
    let comingMeter = 0;
    COLUMNS.forEach((col) => {
      const dayMeter = getValues(`day_meter_${row}_${col}`) || 0;
      comingMeter += +dayMeter || 0;
    });

    setValue(`coming_meter_${row}`, comingMeter);
  };

  const isEmployeeExist = useMemo(() => {
    return {
      isEmployee1Exist: Boolean(employee_1),
      isEmployee2Exist: Boolean(employee_2),
      isEmployee3Exist: Boolean(employee_3),
      isEmployee4Exist: Boolean(employee_4),
      isEmployee5Exist: Boolean(employee_5),
    };
  }, [employee_1, employee_2, employee_3, employee_4, employee_5]);

  return (
    <div className="flex flex-col p-4">
      <Flex justify="space-between">
        <div className="flex items-center gap-5">
          <Button onClick={goBack}>
            <ArrowLeftOutlined />
          </Button>
          <h3 className="m-0 text-primary">Work basis salary generate</h3>
        </div>
        <div>
          <Typography style={customStyle.dateTitleStyle}>
            {dayjs().format("MMMM YYYY")}
          </Typography>
        </div>
        <div className="flex items-center gap-3">
          {/* <Button>Search</Button> */}
          <Button
            type="primary"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
          >
            Save
          </Button>
        </div>
      </Flex>

      <Divider />
      <div
        style={{
          maxHeight: "calc(100vh - 220px)",
          overflowY: "auto",
          border: "1px solid #ccc",
        }}
      >
        <table className="custom-table">
          <thead style={{ position: "sticky", top: 0, zIndex: 999 }}>
            <tr>
              <td>Date</td>
              <td style={{ width: "100px" }}>Machine</td>
              <td style={{ width: "70px" }}>Taka No.</td>
              {COLUMNS.map((col) => {
                return (
                  <td key={col + "_employee"}>
                    <Flex
                      gap={4}
                      style={{ flexDirection: "column", alignItems: "center" }}
                    >
                      <EyeOutlined style={{ cursor: "pointer" }} />
                      <Form.Item
                        name={`employee_${col}`}
                        validateStatus={
                          errors[`employee_${col}`] ? "error" : ""
                        }
                        help={
                          errors[`employee_${col}`] &&
                          errors[`employee_${col}`].message
                        }
                        required={true}
                        wrapperCol={{ sm: 24 }}
                        style={{ margin: 0 }}
                      >
                        <Controller
                          control={control}
                          name={`employee_${col}`}
                          render={({ field }) => (
                            <Select
                              {...field}
                              placeholder={`Select Employee${col}`}
                              loading={isLoadingEmployeeList}
                              options={employeeListOption}
                              style={{
                                textTransform: "capitalize",
                                width: "150px",
                                overflow: "hidden",
                              }}
                              dropdownStyle={{
                                textTransform: "capitalize",
                              }}
                            />
                          )}
                        />
                      </Form.Item>
                    </Flex>
                  </td>
                );
              })}
              {/* <td>
                <Flex
                  gap={4}
                  style={{ flexDirection: "column", alignItems: "center" }}
                >
                  <EyeOutlined style={{ cursor: "pointer" }} />
                  <Form.Item
                    name={`employee_1`}
                    validateStatus={errors[`employee_1`] ? "error" : ""}
                    help={errors[`employee_1`] && errors[`employee_1`].message}
                    required={true}
                    wrapperCol={{ sm: 24 }}
                    style={{ margin: 0 }}
                  >
                    <Controller
                      control={control}
                      name={`employee_1`}
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Select Employee"
                          loading={isLoadingEmployeeList}
                          options={employeeListOption}
                          style={{
                            textTransform: "capitalize",
                            width: "150px",
                            overflow: "hidden",
                          }}
                          dropdownStyle={{
                            textTransform: "capitalize",
                          }}
                        />
                      )}
                    />
                  </Form.Item>
                </Flex>
              </td>
              <td>
                <Flex
                  gap={4}
                  style={{ flexDirection: "column", alignItems: "center" }}
                >
                  <EyeOutlined style={{ cursor: "pointer" }} />
                  <Form.Item
                    name={`employee_2`}
                    validateStatus={errors[`employee_2`] ? "error" : ""}
                    help={errors[`employee_2`] && errors[`employee_2`].message}
                    required={true}
                    wrapperCol={{ sm: 24 }}
                    style={{ margin: 0 }}
                  >
                    <Controller
                      control={control}
                      name={`employee_2`}
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Select Employee"
                          loading={isLoadingEmployeeList}
                          options={employeeListOption}
                          style={{
                            textTransform: "capitalize",
                            width: "150px",
                            overflow: "hidden",
                          }}
                          dropdownStyle={{
                            textTransform: "capitalize",
                          }}
                        />
                      )}
                    />
                  </Form.Item>
                </Flex>
              </td>
              <td>
                <Flex
                  gap={4}
                  style={{ flexDirection: "column", alignItems: "center" }}
                >
                  <EyeOutlined style={{ cursor: "pointer" }} />
                  <Form.Item
                    name={`employee_3`}
                    validateStatus={errors[`employee_3`] ? "error" : ""}
                    help={errors[`employee_3`] && errors[`employee_3`].message}
                    required={true}
                    wrapperCol={{ sm: 24 }}
                    style={{ margin: 0 }}
                  >
                    <Controller
                      control={control}
                      name={`employee_3`}
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Select Employee"
                          loading={isLoadingEmployeeList}
                          options={employeeListOption}
                          style={{
                            textTransform: "capitalize",
                            width: "150px",
                            overflow: "hidden",
                          }}
                          dropdownStyle={{
                            textTransform: "capitalize",
                          }}
                        />
                      )}
                    />
                  </Form.Item>
                </Flex>
              </td>
              <td>
                <Flex
                  gap={4}
                  style={{ flexDirection: "column", alignItems: "center" }}
                >
                  <EyeOutlined style={{ cursor: "pointer" }} />
                  <Form.Item
                    name={`employee_4`}
                    validateStatus={errors[`employee_4`] ? "error" : ""}
                    help={errors[`employee_4`] && errors[`employee_4`].message}
                    required={true}
                    wrapperCol={{ sm: 24 }}
                    style={{ margin: 0 }}
                  >
                    <Controller
                      control={control}
                      name={`employee_4`}
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Select Employee"
                          loading={isLoadingEmployeeList}
                          options={employeeListOption}
                          style={{
                            textTransform: "capitalize",
                            width: "150px",
                            overflow: "hidden",
                          }}
                          dropdownStyle={{
                            textTransform: "capitalize",
                          }}
                        />
                      )}
                    />
                  </Form.Item>
                </Flex>
              </td>
              <td>
                <Flex
                  gap={4}
                  style={{ flexDirection: "column", alignItems: "center" }}
                >
                  <EyeOutlined style={{ cursor: "pointer" }} />
                  <Form.Item
                    name={`employee_5`}
                    validateStatus={errors[`employee_5`] ? "error" : ""}
                    help={errors[`employee_5`] && errors[`employee_5`].message}
                    required={true}
                    wrapperCol={{ sm: 24 }}
                    style={{ margin: 0 }}
                  >
                    <Controller
                      control={control}
                      name={`employee_5`}
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Select Employee"
                          loading={isLoadingEmployeeList}
                          options={employeeListOption}
                          style={{
                            textTransform: "capitalize",
                            width: "150px",
                            overflow: "hidden",
                          }}
                          dropdownStyle={{
                            textTransform: "capitalize",
                          }}
                        />
                      )}
                    />
                  </Form.Item>
                </Flex>
              </td> */}
              <td>M. No.</td>
              <td>B. No.</td>
              <td style={{ width: "100px" }}>Coming Meter</td>
              <td style={{ width: "100px" }}>Actual Meter</td>
            </tr>
          </thead>
          <tbody style={{ height: "calc(100vh - 400px)", overflow: "scroll" }}>
            {datesInMonth.map((date, index) => {
              return (
                <tr key={index}>
                  <td>{dayjs(date).format("DD/MM")}</td>
                  <td>
                    <Form.Item
                      name={`machine_name_${index}`}
                      validateStatus={
                        errors[`machine_name_${index}`] ? "error" : ""
                      }
                      // help={
                      //   errors[`machine_name_${index}`] &&
                      //   errors[`machine_name_${index}`].message
                      // }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ margin: 0 }}
                    >
                      <Controller
                        control={control}
                        name={`machine_name_${index}`}
                        render={({ field }) => (
                          <Select
                            {...field}
                            placeholder="Machine"
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
                  </td>
                  <td>
                    <Form.Item
                      name={`taka_no_${index}`}
                      validateStatus={errors[`taka_no_${index}`] ? "error" : ""}
                      help={
                        errors[`taka_no_${index}`] &&
                        errors[`taka_no_${index}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ margin: 0 }}
                    >
                      <Controller
                        control={control}
                        name={`taka_no_${index}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Taka No"
                            onKeyDown={(e) => handleKeyDown(e, index)}
                          />
                        )}
                      />
                    </Form.Item>
                  </td>
                  {COLUMNS.map((col) => {
                    return (
                      <td key={col + "_day_meter"}>
                        <Form.Item
                          name={`day_meter_${index}_${col}`}
                          validateStatus={
                            errors[`day_meter_${index}_${col}`] ? "error" : ""
                          }
                          help={
                            errors[`day_meter_${index}_${col}`] &&
                            errors[`day_meter_${index}_${col}`].message
                          }
                          required={true}
                          wrapperCol={{ sm: 24 }}
                          style={{ margin: 0 }}
                        >
                          <Controller
                            control={control}
                            name={`day_meter_${index}_${col}`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                style={{ width: "100%" }}
                                disabled={
                                  !isEmployeeExist[`isEmployee${col}Exist`]
                                }
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  calculateComingMeter(index);
                                }}
                              />
                            )}
                          />
                        </Form.Item>
                      </td>
                    );
                  })}
                  {/* <td>
                    Employee 1 text box
                    <Form.Item
                      name={`day_meter_${index}`}
                      validateStatus={
                        errors[`day_meter_${index}`] ? "error" : ""
                      }
                      help={
                        errors[`day_meter_${index}`] &&
                        errors[`day_meter_${index}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ margin: 0 }}
                    >
                      <Controller
                        control={control}
                        name={`day_meter_${index}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            style={{ width: "100%" }}
                            disabled={!isEmployee1Exist}
                          />
                        )}
                      />
                    </Form.Item>
                  </td>
                  <td>
                    Employee 2 text box
                    <Form.Item
                      name={`day_meter_${index}`}
                      validateStatus={
                        errors[`day_meter_${index}`] ? "error" : ""
                      }
                      help={
                        errors[`day_meter_${index}`] &&
                        errors[`day_meter_${index}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ margin: 0 }}
                    >
                      <Controller
                        control={control}
                        name={`day_meter_${index}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            style={{ width: "100%" }}
                            disabled={!isEmployee2Exist}
                          />
                        )}
                      />
                    </Form.Item>
                  </td>
                  <td>
                    Employee 3 text box
                    <Form.Item
                      name={`day_meter_${index}`}
                      validateStatus={
                        errors[`day_meter_${index}`] ? "error" : ""
                      }
                      help={
                        errors[`day_meter_${index}`] &&
                        errors[`day_meter_${index}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ margin: 0 }}
                    >
                      <Controller
                        control={control}
                        name={`day_meter_${index}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            style={{ width: "100%" }}
                            disabled={!isEmployee3Exist}
                          />
                        )}
                      />
                    </Form.Item>
                  </td>
                  <td>
                    Employee 4 text box
                    <Form.Item
                      name={`day_meter_${index}`}
                      validateStatus={
                        errors[`day_meter_${index}`] ? "error" : ""
                      }
                      help={
                        errors[`day_meter_${index}`] &&
                        errors[`day_meter_${index}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ margin: 0 }}
                    >
                      <Controller
                        control={control}
                        name={`day_meter_${index}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            style={{ width: "100%" }}
                            disabled={!isEmployee4Exist}
                          />
                        )}
                      />
                    </Form.Item>
                  </td>
                  <td>
                    Employee 5 text box
                    <Form.Item
                      name={`day_meter_${index}`}
                      validateStatus={
                        errors[`day_meter_${index}`] ? "error" : ""
                      }
                      help={
                        errors[`day_meter_${index}`] &&
                        errors[`day_meter_${index}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ margin: 0 }}
                    >
                      <Controller
                        control={control}
                        name={`day_meter_${index}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            style={{ width: "100%" }}
                            disabled={!isEmployee5Exist}
                          />
                        )}
                      />
                    </Form.Item>
                  </td> */}
                  <td>
                    <Form.Item
                      name={`m_no_${index}`}
                      validateStatus={errors[`m_no_${index}`] ? "error" : ""}
                      help={
                        errors[`m_no_${index}`] &&
                        errors[`m_no_${index}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ margin: 0 }}
                    >
                      <Controller
                        control={control}
                        name={`m_no_${index}`}
                        render={({ field }) => <Input {...field} readOnly />}
                      />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item
                      name={`b_no_${index}`}
                      validateStatus={errors[`b_no_${index}`] ? "error" : ""}
                      help={
                        errors[`b_no_${index}`] &&
                        errors[`b_no_${index}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ margin: 0 }}
                    >
                      <Controller
                        control={control}
                        name={`b_no_${index}`}
                        render={({ field }) => <Input {...field} readOnly />}
                      />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item
                      name={`coming_meter_${index}`}
                      validateStatus={
                        errors[`coming_meter_${index}`] ? "error" : ""
                      }
                      help={
                        errors[`coming_meter_${index}`] &&
                        errors[`coming_meter_${index}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ margin: 0 }}
                    >
                      <Controller
                        control={control}
                        name={`coming_meter_${index}`}
                        render={({ field }) => <Input {...field} readOnly />}
                      />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item
                      name={`actual_meter_${index}`}
                      validateStatus={
                        errors[`actual_meter_${index}`] ? "error" : ""
                      }
                      help={
                        errors[`actual_meter_${index}`] &&
                        errors[`actual_meter_${index}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ margin: 0 }}
                    >
                      <Controller
                        control={control}
                        name={`actual_meter_${index}`}
                        render={({ field }) => <Input {...field} readOnly />}
                      />
                    </Form.Item>

                    {/* <Form.Item
                      name={`inhouse_production_id_${index}`}
                      validateStatus={
                        errors[`inhouse_production_id_${index}`] ? "error" : ""
                      }
                      help={
                        errors[`inhouse_production_id_${index}`] &&
                        errors[`inhouse_production_id_${index}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ margin: 0 }}
                    > */}
                    <Controller
                      control={control}
                      name={`inhouse_production_id_${index}`}
                      render={({ field }) => (
                        <Input {...field} type="hidden" readOnly />
                      )}
                    />
                    {/* </Form.Item> */}

                    {/* <Form.Item
                      name={`beam_load_id_${index}`}
                      validateStatus={
                        errors[`beam_load_id_${index}`] ? "error" : ""
                      }
                      help={
                        errors[`beam_load_id_${index}`] &&
                        errors[`beam_load_id_${index}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ margin: 0 }}
                    > */}
                    <Controller
                      control={control}
                      name={`beam_load_id_${index}`}
                      render={({ field }) => (
                        <Input {...field} type="hidden" readOnly />
                      )}
                    />
                    {/* </Form.Item> */}

                    {/* <Form.Item
                      name={`quality_id_${index}`}
                      validateStatus={
                        errors[`quality_id_${index}`] ? "error" : ""
                      }
                      help={
                        errors[`quality_id_${index}`] &&
                        errors[`quality_id_${index}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ margin: 0 }}
                    > */}
                    <Controller
                      control={control}
                      name={`quality_id_${index}`}
                      render={({ field }) => (
                        <Input {...field} type="hidden" readOnly />
                      )}
                    />
                    {/* </Form.Item> */}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddSalaryReport;
