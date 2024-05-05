import { ArrowLeftOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Col, Flex, Form, Input, Radio, Row, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { DevTool } from "@hookform/devtools";
import { useContext, useEffect } from "react";
import {
  getSupervisorByIdRequest,
  updateUserRequest,
} from "../../../api/requests/users";
import { USER_ROLES } from "../../../constants/userRole";
import { AadharRegex } from "../../../constants/regex";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { mutationOnErrorHandler } from "../../../utils/mutationUtils";

const updateSupervisorSchemaResolver = yupResolver(
  yup.object().shape({
    first_name: yup.string().required("Please enter first name"),
    last_name: yup.string().required("Please enter last name"),
    email: yup
      .string()
      .required("Please enter email address")
      .email("Please enter valid email address"),
    address: yup.string().required("Please enter address"),
    gst_no: yup.string().nullable(),
    // .required("Please enter GST"),
    // .matches(GSTRegex, "Enter valid GST number"),
    pancard_no: yup.string().nullable(),
    // .required('Please enter pan number')
    // .matches(PANRegex, "Enter valid PAN number"),
    adhar_no: yup
      .string()
      .required("Please enter Aadhar number")
      .matches(AadharRegex, "Enter valid Aadhar number"),
    supervisor_type: yup.string().required("Please select supervisor type"),
  })
);

const roleId = USER_ROLES.SUPERVISOR.role_id;

function UpdateSupervisor() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const { companyId } = useContext(GlobalContext);

  function goBack() {
    navigate(-1);
  }

  const { mutateAsync: updateUser } = useMutation({
    mutationFn: async (data) => {
      const res = await updateUserRequest({
        roleId,
        userId: id,
        data,
        params: { company_id: companyId },
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
      mutationOnErrorHandler({ error, message });
    },
  });

  const { data: userDetails } = useQuery({
    queryKey: ["supervisor", "get", id, { company_id: companyId }],
    queryFn: async () => {
      const res = await getSupervisorByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data?.user;
    },
    enabled: Boolean(companyId),
  });

  async function onSubmit(data) {
    await updateUser(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: updateSupervisorSchemaResolver,
  });

  useEffect(() => {
    if (userDetails) {
      reset({
        ...userDetails,
        supervisor_type: userDetails?.supervisor?.supervisor_type,
        company_ids: userDetails?.supervisor_companies?.map(
          (c) => c?.company_id
        ),
        // remove unnecessary fields
        id: undefined,
        deletedAt: undefined,
        createdAt: undefined,
        mobile: undefined,
        updatedAt: undefined,
      });
    }
  }, [userDetails, reset]);

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
          <Col span={12}>
            <Form.Item
              label={<p className="m-0 whitespace-nowrap">First Name</p>}
              name="first_name"
              validateStatus={errors.first_name ? "error" : ""}
              help={errors.first_name && errors.first_name.message}
              className=""
              wrapperCol={{ sm: 24 }}
              required={true}
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
              required={true}
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
              label="Email"
              name="email"
              validateStatus={errors.email ? "error" : ""}
              help={errors.email && errors.email.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Input {...field} placeholder="Email" type="email" />
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
              required={true}
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

          {/* <Col span={12}>
            <Form.Item
              label="Password"
              name="password"
              validateStatus={errors.password ? "error" : ""}
              help={errors.password && errors.password.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                )}
              />
            </Form.Item>
          </Col> */}

          <Col span={12}>
            <Form.Item
              label="GST No"
              name="gst_no"
              validateStatus={errors.gst_no ? "error" : ""}
              help={errors.gst_no && errors.gst_no.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="gst_no"
                render={({ field }) => (
                  <Input {...field} placeholder="GST No" />
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
              required={true}
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

          <Col span={12}>
            <Form.Item
              label="Supervisor Type"
              name="supervisor_type"
              validateStatus={errors.supervisor_type ? "error" : ""}
              help={errors.supervisor_type && errors.supervisor_type.message}
              wrapperCol={{ sm: 24 }}
              required={true}
            >
              <Controller
                control={control}
                name="supervisor_type"
                render={({ field }) => (
                  <Radio.Group {...field}>
                    <Radio value={"senior"}>Senior</Radio>
                    <Radio value={"super_senior"}>Semi-Senior</Radio>
                  </Radio.Group>
                )}
              />
            </Form.Item>
          </Col>

          {/* <Col span={12}>
            <Form.Item
              label="Companies"
              name="company_ids"
              validateStatus={errors.company_ids ? "error" : ""}
              help={errors.company_ids && errors.company_ids.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="company_ids"
                render={({ field }) => (
                  <Select
                    mode="multiple"
                    allowClear
                    // style={{
                    //   width: "100%",
                    // }}
                    placeholder="Please select companies"
                    {...field}
                    options={companyListRes?.rows?.map((company) => ({
                      label: company.company_name,
                      value: company.id,
                    }))}
                  />
                )}
              />
            </Form.Item>
          </Col> */}
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

export default UpdateSupervisor;
