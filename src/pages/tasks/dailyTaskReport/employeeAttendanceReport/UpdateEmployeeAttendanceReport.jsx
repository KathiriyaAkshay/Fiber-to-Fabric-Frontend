import { ArrowLeftOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Col, Flex, Form, Input, Row, Select, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getEmployeeListRequest } from "../../../../api/requests/users";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import {
  getEmployeeAttendanceReportByIdRequest,
  updateEmployeeAttendanceReportRequest,
} from "../../../../api/requests/reports/employeeAttendance";

const updateEmployeeAttendanceReportSchemaResolver = yupResolver(
  yup.object().shape({
    machine_id: yup.string().required("Please select machine name"),
    absent_employee_count: yup
      .string()
      .required("Please enter absent employee count"),
    shift: yup.string().required("Please select shift"),
    user_ids: yup.array().of(yup.string()).required("Please select Employees"),
  })
);

function UpdateEmployeeAttendanceReport() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const { companyId } = useContext(GlobalContext);

  function goBack() {
    navigate(-1);
  }

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

  const { mutateAsync: updateEmployeeAttendanceReport } = useMutation({
    mutationFn: async (data) => {
      if (parseInt(data?.absent_employee_count) !== data?.user_ids?.length) {
        message.warning(`Please select ${data?.absent_employee_count} absend employee`)
      } else {
        const res = await updateEmployeeAttendanceReportRequest({
          id,
          data,
          params: {
            company_id: companyId,
          },
        });
        return res.data;
      }
    },
    mutationKey: ["reports/employee-attandance-report/update", id],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  const { data: reportDetails } = useQuery({
    queryKey: ["reports/employee-attandance-report/get", id],
    queryFn: async () => {
      const res = await getEmployeeAttendanceReportByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data?.employee_attendance_report;
    },
    enabled: Boolean(companyId),
  });

  async function onSubmit(data) {
    // delete parameter's those are not allowed
    delete data?.report_time;
    await updateEmployeeAttendanceReport(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: updateEmployeeAttendanceReportSchemaResolver,
  });
  const { absent_employee_count, user_ids } = watch();

  useEffect(() => {
    if (reportDetails) {
      const { machine, absent_employee_count, shift, report_absentees } =
        reportDetails;

      reset({
        machine_id: machine?.id,
        absent_employee_count: absent_employee_count,
        shift: shift,
        user_ids: report_absentees?.map((ra) => ra?.user_id),
      });
    }
  }, [reportDetails, reset]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Update Notes</h3>
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
                      label:`${user?.first_name} ${user?.last_name} ( ${user?.employer?.employee_type?.employee_type} )`,
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
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Flex>
      </Form>

    </div>
  );
}

export default UpdateEmployeeAttendanceReport;
