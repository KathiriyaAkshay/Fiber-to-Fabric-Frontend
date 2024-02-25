import { ArrowLeftOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
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
import { DevTool } from "@hookform/devtools";
import { useEffect } from "react";
import {
  getEmployeeByIdRequest,
  updateUserRequest,
} from "../../../api/requests/users";
import { USER_ROLES } from "../../../constants/userRole";
import SalaryTypeSpecificFields from "../../../components/userMaster/employee/SalaryTypeSpecificFields";
import EmployeeSalaryTypeInput from "../../../components/userMaster/employee/EmployeeSalaryTypeInput";
import dayjs from "dayjs";
import { useCompanyList } from "../../../api/hooks/company";

const updateEmployeeSchemaResolver = yupResolver(
  yup.object().shape({
    first_name: yup.string().required("Please provide first name"),
    last_name: yup.string().required("Please provide last name"),
    employee_type_id: yup.string().required("Please select employee type"),
    // salary_type: yup.string().required("Please select salary type"),
    company_id: yup.string().required("Please select company"),
    joining_date: yup.string().required("Please select joining date"),
    tds: yup.string().required("Please enter TDS"),
    salary: yup
      .string()
      .nullable()
      .when("salary_type", {
        is: "monthly",
        then: () =>
          yup.string().required("Please provide salary for monthly type"),
      }),
    per_attendance: yup
      .string()
      .nullable()
      .when("salary_type", {
        is: "attendance",
        then: () => yup.string().required("Please provide rate per attendance"),
      }),
    per_meter: yup
      .string()
      .nullable()
      .when("salary_type", {
        is: "on production",
        then: () => yup.string().required("Please provide rate per meter"),
      }),
    machineNo_from: yup
      .string()
      .nullable()
      .when("salary_type", {
        is: "work basis",
        then: () => yup.string().required("Please provide rate per meter"),
      }),
    machineNo_to: yup
      .string()
      .nullable()
      .when("salary_type", {
        is: "work basis",
        then: () =>
          yup
            .string()
            .required("Please provide rate per meter")
            .min(yup.ref("machineNo_from"), "To must be greater than From"),
      }),
  })
);

const roleId = USER_ROLES.EMPLOYEE.role_id;

function UpdateEmployee() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;

  function goBack() {
    navigate(-1);
  }

  const { mutateAsync: updateUser } = useMutation({
    mutationFn: async (data) => {
      const res = await updateUserRequest({
        roleId,
        userId: id,
        data,
      });
      return res.data;
    },
    mutationKey: ["users", "update", roleId, id],
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

  const { data: userDetails } = useQuery({
    queryKey: ["employee", "get", id],
    queryFn: async () => {
      const res = await getEmployeeByIdRequest({ id });
      return res.data?.data?.user;
    },
  });

  async function onSubmit(data) {
    await updateUser(data);
  }

  const { data: companyListRes, isLoading: isLoadingCompanyList } =
    useCompanyList();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: updateEmployeeSchemaResolver,
  });

  useEffect(() => {
    if (userDetails) {
      const { first_name, last_name, employer } = userDetails;
      const {
        tds,
        employee_type_id,
        joining_date,
        company_id,
        salary_type,
        machineNo_from,
        machineNo_to,
        per_attendance,
        per_meter,
      } = employer;

      reset({
        first_name,
        last_name,
        tds,
        employee_type_id,
        joining_date: dayjs(joining_date),
        company_id,
        salary_type,
        machineNo_from,
        machineNo_to,
        per_attendance,
        per_meter,
      });
    }
  }, [userDetails, reset]);

  console.log("errors", errors);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Update User</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <EmployeeSalaryTypeInput
            errors={errors}
            control={control}
            watch={watch}
            setValue={setValue}
            isUpdate={true}
          />
          <Col span={12}>
            <Form.Item
              label="Joining Date"
              name="joining_date"
              validateStatus={errors.joining_date ? "error" : ""}
              help={errors.joining_date && errors.joining_date.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="joining_date"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    style={{
                      width: "100%",
                    }}
                    format="DD/MM/YYYY"
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Select Company"
              name="company_id"
              validateStatus={errors.company_id ? "error" : ""}
              help={errors.company_id && errors.company_id.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="company_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Company"
                    allowClear
                    loading={isLoadingCompanyList}
                    options={companyListRes?.rows?.map((et) => ({
                      label: et?.company_name,
                      value: et?.id,
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
              label={<p className="m-0 whitespace-nowrap">First Name</p>}
              name="first_name"
              validateStatus={errors.first_name ? "error" : ""}
              help={errors.first_name && errors.first_name.message}
              className=""
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="first_name"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="First Name"
                    className="w-full"
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={<p className="m-0 whitespace-nowrap">Last Name</p>}
              name="last_name"
              validateStatus={errors.last_name ? "error" : ""}
              help={errors.last_name && errors.last_name.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="last_name"
                render={({ field }) => (
                  <Input {...field} placeholder="Last Name" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={<p className="m-0 whitespace-nowrap">TDS</p>}
              name="tds"
              validateStatus={errors.tds ? "error" : ""}
              help={errors.tds && errors.tds.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="tds"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="5"
                    type="number"
                    min={0}
                    step=".01"
                  />
                )}
              />
            </Form.Item>
          </Col>

          <SalaryTypeSpecificFields
            salaryType={watch("salary_type")}
            errors={errors}
            control={control}
          />
        </Row>

        <Flex gap={10} justify="flex-end">
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Flex>
      </Form>

      <DevTool control={control} />
    </div>
  );
}

export default UpdateEmployee;
