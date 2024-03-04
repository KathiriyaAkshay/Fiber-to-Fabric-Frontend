import { ArrowLeftOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Col, Flex, Form, Input, Row, Select, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { DevTool } from "@hookform/devtools";
import { useEffect } from "react";
import {
  getBrokerListRequest,
  getPartyByIdRequest,
  updateUserRequest,
} from "../../../api/requests/users";
import { USER_ROLES } from "../../../constants/userRole";
import { AadharRegex } from "../../../constants/regex";
import { useCompanyList } from "../../../api/hooks/company";

const updatePartySchemaResolver = yupResolver(
  yup.object().shape({
    first_name: yup.string(),
    last_name: yup.string(),
    email: yup
      .string()
      .required("Please enter email address")
      .email("Please enter valid email address"),
    address: yup.string(),
    gst_no: yup.string().required("Please enter GST"),
    // .matches(GSTRegex, "Enter valid GST number"),
    pancard_no: yup.string(),
    // .required('Please enter pan number')
    // .matches(PANRegex, "Enter valid PAN number"),
    adhar_no: yup
      .string()
      // .required("Please enter Aadhar number")
      .matches(AadharRegex, "Enter valid Aadhar number"),
  })
);

const roleId = USER_ROLES.PARTY.role_id;

function UpdateParty() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;

  function goBack() {
    navigate(-1);
  }

  const { data: companyListRes } = useCompanyList();

  const companyId = companyListRes?.rows?.[0]?.id;

  const { data: brokerUserListRes, isLoading: isLoadingBrokerList } = useQuery({
    queryKey: ["broker", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getBrokerListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

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
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  const { data: userDetails } = useQuery({
    queryKey: ["party", "get", id],
    queryFn: async () => {
      const res = await getPartyByIdRequest({ id });
      return res.data?.data?.user;
    },
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
    resolver: updatePartySchemaResolver,
  });

  useEffect(() => {
    if (userDetails) {
      reset({
        ...userDetails,
        checker_name: userDetails?.party?.checker_name,
        checker_number: userDetails?.party?.checker_number,
        delivery_address: userDetails?.party?.delivery_address,
        overdue_day_limit: userDetails?.party?.overdue_day_limit,
        credit_limit: userDetails?.party?.credit_limit,
        company_name: userDetails?.party?.company_name,
        company_gst_number: userDetails?.party?.company_gst_number,
        broker_ids: userDetails?.party_user?.map((u) => u?.broker_id),

        // remove unnecessary fields
        id: undefined,
        deletedAt: undefined,
        createdAt: undefined,
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
              label="Email"
              name="email"
              validateStatus={errors.email ? "error" : ""}
              help={errors.email && errors.email.message}
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
              label="Checker Name"
              name="checker_name"
              validateStatus={errors.checker_name ? "error" : ""}
              help={errors.checker_name && errors.checker_name.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="checker_name"
                render={({ field }) => (
                  <Input {...field} placeholder="Checker Name" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Checker Number"
              name="checker_number"
              validateStatus={errors.checker_number ? "error" : ""}
              help={errors.checker_number && errors.checker_number.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="checker_number"
                render={({ field }) => (
                  <Input {...field} placeholder="Checker Number" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Delivery Address"
              name="delivery_address"
              validateStatus={errors.delivery_address ? "error" : ""}
              help={errors.delivery_address && errors.delivery_address.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="delivery_address"
                render={({ field }) => (
                  <Input {...field} placeholder="Delivery Address" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Overdue Day Limit"
              name="overdue_day_limit"
              validateStatus={errors.overdue_day_limit ? "error" : ""}
              help={
                errors.overdue_day_limit && errors.overdue_day_limit.message
              }
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="overdue_day_limit"
                render={({ field }) => (
                  <Input {...field} placeholder="7" type="number" min={0} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Credit Limit"
              name="credit_limit"
              validateStatus={errors.credit_limit ? "error" : ""}
              help={errors.credit_limit && errors.credit_limit.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="credit_limit"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="1500.50"
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
              label="Company Name"
              name="company_name"
              validateStatus={errors.company_name ? "error" : ""}
              help={errors.company_name && errors.company_name.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="company_name"
                render={({ field }) => (
                  <Input {...field} placeholder="Company Name" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Company GST Number"
              name="company_gst_number"
              validateStatus={errors.company_gst_number ? "error" : ""}
              help={
                errors.company_gst_number && errors.company_gst_number.message
              }
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="company_gst_number"
                render={({ field }) => (
                  <Input {...field} placeholder="Company GST Number" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Brokers"
              name="broker_ids"
              validateStatus={errors.broker_ids ? "error" : ""}
              help={errors.broker_ids && errors.broker_ids.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="broker_ids"
                render={({ field }) => (
                  <Select
                    mode="multiple"
                    allowClear
                    placeholder="Please select brokers"
                    loading={isLoadingBrokerList}
                    {...field}
                    options={brokerUserListRes?.brokerList?.rows?.map(
                      (broker) => ({
                        label: broker.first_name + " " + broker.last_name,
                        value: broker.id,
                      })
                    )}
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

      <DevTool control={control} />
    </div>
  );
}

export default UpdateParty;
