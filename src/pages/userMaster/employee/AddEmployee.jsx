import { ArrowLeftOutlined } from "@ant-design/icons";
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
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DevTool } from "@hookform/devtools";
import { addUserRequest } from "../../../api/requests/users";
import { USER_ROLES } from "../../../constants/userRole";
import PhoneInput from "react-phone-number-input";
import ForwardRefInput from "../../../components/common/ForwardRefInput";
import { getCompanyListRequest } from "../../../api/requests/company";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { isValidPhoneNumber } from "react-phone-number-input";
import dayjs from "dayjs";
import EmployeeSalaryTypeInput from "../../../components/userMaster/employee/EmployeeSalaryTypeInput";
import SalaryTypeSpecificFields from "../../../components/userMaster/employee/SalaryTypeSpecificFields";

const roleId = USER_ROLES.EMPLOYEE.role_id;

const addEmployeeSchemaResolver = yupResolver(
  yup.object().shape({
    first_name: yup.string().required("Please provide first name"),
    last_name: yup.string().required("Please provide last name"),
    mobile: yup
      .string()
      .required("Please enter Contact number")
      .test("Mobile Validation", "Please enter valid Contact Number", (value) =>
        value ? isValidPhoneNumber(value) : false
      ),
    username: yup.string().required("Please enter username"),
    employee_type_id: yup.string().required("Please select employee type"),
    salary_type: yup.string().required("Please select salary type"),
    company_id: yup.string().required("Please select company"),
    joining_date: yup.string().required("Please select joining date"),
    tds: yup.string().required("Please enter TDS"),
    salary: yup.string().when("salary_type", {
      is: "monthly",
      then: () =>
        yup.string().required("Please provide salary for monthly type"),
    }),
    per_attendance: yup.string().when("salary_type", {
      is: "attendance",
      then: () => yup.string().required("Please provide rate per attendance"),
    }),
    per_meter: yup.string().when("salary_type", {
      is: "on production",
      then: () => yup.string().required("Please provide rate per meter"),
    }),
    machineNo_from: yup.string().when("salary_type", {
      is: "work basis",
      then: () => yup.string().required("Please provide rate per meter"),
    }),
    machineNo_to: yup.string().when("salary_type", {
      is: "work basis",
      then: () => yup.string().required("Please provide rate per meter"),
    }),
  })
);

function AddEmployee() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  function goBack() {
    navigate(-1);
  }

  const { data: companyListRes, isLoading: isLoadingCompanyList } = useQuery({
    queryKey: ["company", "list"],
    queryFn: async () => {
      const res = await getCompanyListRequest({});
      return res.data?.data;
    },
  });

  const companyId = companyListRes?.rows?.[0]?.id;

  const { mutateAsync: addUser } = useMutation({
    mutationFn: async (data) => {
      const res = await addUserRequest({
        roleId,
        data,
      });
      return res.data;
    },
    mutationKey: ["users", "add", roleId],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "employee",
        "list",
        { company_id: companyId },
      ]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      if (typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  async function onSubmit(data) {
    await addUser(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: addEmployeeSchemaResolver,
    defaultValues: {
      joining_date: dayjs(),
    },
  });

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h2 className="m-0">Add New Employee</h2>
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
              label={<p className="m-0 whitespace-nowrap">Phone Number</p>}
              name="mobile"
              validateStatus={errors.mobile ? "error" : ""}
              help={errors.mobile && errors.mobile.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="mobile"
                render={({ field }) => (
                  <PhoneInput
                    {...field}
                    placeholder="Enter phone number"
                    defaultCountry="IN"
                    international
                    inputComponent={ForwardRefInput}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Username"
              name="username"
              validateStatus={errors.username ? "error" : ""}
              help={errors.username && errors.username.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="username"
                render={({ field }) => (
                  <Input {...field} placeholder="Username" />
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
          <Button htmlType="button" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Flex>
      </Form>

      <DevTool control={control} />
    </div>
  );
}

export default AddEmployee;
