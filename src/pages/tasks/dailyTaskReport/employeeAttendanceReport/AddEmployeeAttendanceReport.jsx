import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Col, Flex, Form, Input, Row, Select, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { createEmployeeAttendanceReportRequest } from "../../../../api/requests/reports/employeeAttendance";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import { getEmployeeListRequest } from "../../../../api/requests/users";

const addEmployeeAttendanceReportSchemaResolver = yupResolver(
  yup.object().shape({
    machine_id: yup.string().required("Please select machine name"),
    absent_employee_count: yup
      .string()
      .required("Please enter absent employee count"),
    shift: yup.string().required("Please select shift"),
    user_ids: yup.array().of(yup.string()).required("Please select Employees"),
  })
);

function AddEmployeeAttendanceReport() {
  const { companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: machineListRes, isLoading: isLoadingMachineList } = useQuery({
    queryKey: [`machine/list/${companyId}`, { company_id: companyId }],
    queryFn: async () => {
      const res = await getCompanyMachineListRequest({
        companyId,
        params: { company_id: companyId },
      });
      return res.data?.data?.machineList;
    },
    enabled: Boolean(companyId),
  });

  const { data: EmployeeListRes, isLoading: isLoadingEmployeeList } = useQuery({
    queryKey: [
      "employee",
      "list",
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

  const { mutateAsync: createEmployeeAttendance } = useMutation({
    mutationFn: async (data) => {
      const res = await createEmployeeAttendanceReportRequest({
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["reports/employee-attandance-report/create"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["reports", "list", companyId]);
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

  function goBack() {
    navigate(-1);
  }

  async function onSubmit(data) {
    await createEmployeeAttendance(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: addEmployeeAttendanceReportSchemaResolver,
    defaultValues: {},
  });

  const { absent_employee_count, user_ids } = watch();
  // console.log("errors----->", errors);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Attendance Reporting</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={12}>
            <Form.Item
              label="Machine Name"
              name="machine_id"
              validateStatus={errors.machine_id ? "error" : ""}
              help={errors.machine_id && errors.machine_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
              style={{
                marginBottom: "8px",
              }}
            >
              <Controller
                control={control}
                name="machine_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Machine Name"
                    allowClear
                    loading={isLoadingMachineList}
                    options={machineListRes?.rows?.map((machine) => ({
                      label: machine?.machine_name,
                      value: machine?.id,
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

          <Col span={12}>
            <Form.Item
              label="Absent Employee Count"
              name="absent_employee_count"
              validateStatus={errors.absent_employee_count ? "error" : ""}
              help={
                errors.absent_employee_count &&
                errors.absent_employee_count.message
              }
              wrapperCol={{ sm: 24 }}
              disabled
            >
              <Controller
                control={control}
                name="absent_employee_count"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="1"
                    type="number"
                    min={0}
                    step={1}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name={`shift`}
              validateStatus={errors.shift ? "error" : ""}
              help={errors?.shift?.message}
              required={true}
              className="mb-0"
              label="Shift"
            >
              <Controller
                control={control}
                name={`shift`}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={[
                      {
                        label: "Day",
                        value: "day",
                      },
                      {
                        label: "Night",
                        value: "night",
                      },
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

          <Col span={12}>
            <Form.Item
              label="Employee"
              name="user_ids"
              validateStatus={errors.user_ids ? "error" : ""}
              help={errors.user_ids && errors.user_ids.message}
              wrapperCol={{ sm: 24 }}
              required = {true}
            >
              <Controller
                control={control}
                name="user_ids"
                render={({ field }) => (
                  <Select
                    mode="multiple"
                    allowClear
                    placeholder="Please select Employees"
                    loading={isLoadingEmployeeList}
                    {...field}
                    options={EmployeeListRes?.rows?.map((user) => ({
                      label: user.first_name + " " + user.last_name,
                      value: user.id,
                      disabled:
                        !absent_employee_count ||
                        (user_ids?.length >= absent_employee_count &&
                          !user_ids?.includes(user?.id)),
                    }))}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Flex>
      </Form>

    </div>
  );
}

export default AddEmployeeAttendanceReport;
