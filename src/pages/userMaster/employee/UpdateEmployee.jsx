import { ArrowLeftOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Col, Flex, Form, Input, Row, message } from "antd";
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

const updateEmployeeSchemaResolver = yupResolver(
  yup.object().shape({
    first_name: yup.string().required("Please provide first name"),
    last_name: yup.string().required("Please provide last name"),
    employee_type_id: yup.string().required("Please select employee type"),
    tds: yup.string().required("Please enter TDS"),
    // salary_type: yup.string().required("Please select salary type"),
    // company_id: yup.string().required("Please select company"),
    // joining_date: yup.string().required("Please select joining date"),
    // salary: yup.string().when("salary_type", {
    //   is: "monthly",
    //   then: () =>
    //     yup.string().required("Please provide salary for monthly type"),
    // }),
    // per_attendance: yup.string().when("salary_type", {
    //   is: "attendance",
    //   then: () => yup.string().required("Please provide salary per attendance"),
    // }),
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

  // const { data: companyListRes } = useQuery({
  //   queryKey: ["company", "list"],
  //   queryFn: async () => {
  //     const res = await getCompanyListRequest({});
  //     return res.data?.data;
  //   },
  // });

  // const companyId = companyListRes?.rows?.[0]?.id;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: updateEmployeeSchemaResolver,
  });

  console.log("errors", errors);

  useEffect(() => {
    if (userDetails) {
      const { first_name, last_name, employer } = userDetails;
      const { tds, employee_type_id } = employer;
      reset({ first_name, last_name, tds, employee_type_id });
    }
  }, [userDetails, reset]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h2 className="m-0">Update User</h2>
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
              label="Address"
              name="address"
              validateStatus={errors.address ? "error" : ""}
              help={errors.address && errors.address.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="address"
                render={({ field }) => (
                  <Input {...field} placeholder="Address" />
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

          <Col span={12}>
            <Form.Item
              label="Aadhar No"
              name="adhar_no"
              validateStatus={errors.adhar_no ? "error" : ""}
              help={errors.adhar_no && errors.adhar_no.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="adhar_no"
                render={({ field }) => (
                  <Input {...field} placeholder="Aadhar No" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="PAN No"
              name="pancard_no"
              validateStatus={errors.pancard_no ? "error" : ""}
              help={errors.pancard_no && errors.pancard_no.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="pancard_no"
                render={({ field }) => (
                  <Input {...field} placeholder="PAN No" />
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

      <DevTool control={control} />
    </div>
  );
}

export default UpdateEmployee;
