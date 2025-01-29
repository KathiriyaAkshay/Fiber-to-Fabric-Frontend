import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  message,
  Row,
  Select,
} from "antd";
import { Controller, useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
// import { addUserRequest } from "../../../api/requests/users";
import { USER_ROLES } from "../../../constants/userRole";
import PhoneInput from "react-phone-number-input";
import ForwardRefInput from "../../../components/common/ForwardRefInput";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { isValidPhoneNumber } from "react-phone-number-input";
import { AadharRegex } from "../../../constants/regex";
// import { GlobalContext } from "../../../contexts/GlobalContext";
import { mutationOnErrorHandler } from "../../../utils/mutationUtils";
import { signupRequest } from "../../../api/requests/auth";

const roleId = USER_ROLES.ADMIN.role_id;

const signUpSchemaResolver = yupResolver(
  yup.object().shape({
    first_name: yup.string().required("Please enter first name"),
    last_name: yup.string().required("Please enter last name"),
    mobile: yup
      .string()
      .required("Please enter Contact number")
      .test("Mobile Validation", "Please enter valid Contact Number", (value) =>
        value ? isValidPhoneNumber(value) : false
      ),
    email: yup
      .string()
      .required("Please enter email address")
      .email("Please enter valid email address"),
    address: yup.string().required("Please enter address"),
    gst_no: yup.string().required("Please enter GST"),
    // .matches(GSTRegex, "Enter valid GST number"),
    pancard_no: yup.string().required("Please enter pan number"),
    // .matches(PANRegex, "Enter valid PAN number"),
    username: yup.string().required("Please enter username"),
    adhar_no: yup
      .string()
      .required("Please enter Aadhar number")
      .matches(AadharRegex, "Enter valid Aadhar number"),
    password: yup
      .string()
      .min(8, "Password is too short - should be 8 chars minimum.")
      .required("No password provided."),
    // supervisor_type: yup.string().required("Please select supervisor type"),

    // Company validation--------------------------------------------------------------------

    // owner_mobile: yup
    //   .string()
    //   .test("Mobile Validation", "Please enter valid Contact Number", (value) =>
    //     value ? isValidPhoneNumber(value) : false
    //   ),
    // gst_no: yup.string().required("Please enter GST"),
    // owner_name: yup.string().required(),
    company_name: yup.string().required("Please enter company name"),
    // pancard_no: yup.string().required(),
    // adhar_no: yup.string().required(),
    company_unit: yup.string().required("Please enter company unit"),
    bill_number_format: yup
      .string()
      .required("Please enter bill number format"),
    company_email: yup.string().required("Please enter company email"),
    // company_contact: yup.string().required(),
    address_line_1: yup.string().required("Please enter address line 1"),
    address_line_2: yup.string(),
    country: yup.string().required("Please enter country"),
    state: yup.string().required("Please enter state"),
    city: yup.string().required("Please enter city"),
    pincode: yup.string().required("Please enter pincode"),
    bill_title: yup.string().required("Please enter bill title"),
    bank_name: yup.string().required("Please enter bank name"),
    account_number: yup.string().required("Please enter account number"),
    ifsc_code: yup.string().required("Please enter IFSC code"),
    company_types: yup
      .array()
      // .of(yup.string().oneOf(enumValues, "Invalid company type value"))
      .required("Enum array is required"),
    account_type: yup.string().required("Please enter account type"),
  })
);

function SignUp() {
  // const queryClient = useQueryClient();
  // const navigate = useNavigate();

  // const {
  //   companyId,
  //   // companyListRes
  // } = useContext(GlobalContext);

  const { mutateAsync: signup } = useMutation({
    mutationFn: async (data) => {
      const res = await signupRequest(data);
      return res.data;
    },
    onSuccess: (res) => {
      console.log(res);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      reset();
    },
    onError: (error) => {
      mutationOnErrorHandler({ error });
    },
  });

  async function onSubmit(data) {
    console.log({ data });

    const payload = {
      signUpData: {
        first_name: data.first_name,
        last_name: data.last_name,
        mobile: data.mobile,
        email: data.email,
        address: data.address,
        role_id: roleId,
        password: data.password,
        gst_no: data.gst_no,
        adhar_no: data.adhar_no,
        pancard_no: data.pancard_no,
        username: data.username,
      },
      companyData: {
        gst_no: data.gst_no,
        owner_name: data.first_name + " " + data.last_name,
        owner_mobile: data.mobile,
        pancard_no: data.pancard_no,
        adhar_no: data.adhar_no,
        company_contact: data.mobile,
        //
        company_name: data.company_name,
        company_unit: data.company_unit,
        bill_number_format: data.bill_number_format,
        company_email: data.company_email,
        country: data.country,
        state: data.state,
        city: data.city,
        pincode: data.pincode,
        bill_title: data.bill_title,
        company_types: data.company_types,
        address_line_1: data.address_line_1,
        address_line_2: data.address_line_2,
        bank_name: data.bank_name,
        ifsc_code: data.ifsc_code,
        account_number: data.account_number,
        account_type: data.account_type,
      },
    };
    console.log({ payload });

    await signup(payload);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: signUpSchemaResolver,
  });

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        {/* <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button> */}
        <h3 className="m-0 text-primary">Sign Up</h3>
      </div>
      <Form
        layout="vertical"
        onFinish={handleSubmit(onSubmit)}
        autoComplete="off"
      >
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
              label={<p className="m-0 whitespace-nowrap">Phone Number</p>}
              name="mobile"
              validateStatus={errors.mobile ? "error" : ""}
              help={errors.mobile && errors.mobile.message}
              required={true}
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
                    type="password"
                    placeholder="Password"
                    autoComplete="off"
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Adhar No"
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
              label="Username"
              name="username"
              validateStatus={errors.username ? "error" : ""}
              help={errors.username && errors.username.message}
              wrapperCol={{ sm: 24 }}
              required={true}
            >
              <Controller
                control={control}
                name="username"
                render={({ field }) => (
                  <Input {...field} placeholder="Username" autoComplete="off" />
                )}
              />
            </Form.Item>
          </Col>

          <Divider />

          <Col span={12}>
            <Form.Item
              label="Company Name"
              name="company_name"
              validateStatus={errors.company_name ? "error" : ""}
              help={errors.company_name && errors.company_name.message}
              required={true}
            >
              <Controller
                control={control}
                name="company_name"
                render={({ field }) => (
                  <Input {...field} placeholder="Company name" />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Company Unit"
              name="company_unit"
              validateStatus={errors.company_unit ? "error" : ""}
              help={errors.company_unit && errors.company_unit.message}
              required={true}
            >
              <Controller
                control={control}
                name="company_unit"
                render={({ field }) => (
                  <Input {...field} placeholder="Unit A" />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Bill Number Format"
              name="bill_number_format"
              validateStatus={errors.bill_number_format ? "error" : ""}
              help={
                errors.bill_number_format && errors.bill_number_format.message
              }
              required={true}
            >
              <Controller
                control={control}
                name="bill_number_format"
                render={({ field }) => (
                  <Input {...field} placeholder="BNF-0001" />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Company Email"
              name="company_email"
              validateStatus={errors.company_email ? "error" : ""}
              help={errors.company_email && errors.company_email.message}
              required={true}
            >
              <Controller
                control={control}
                name="company_email"
                render={({ field }) => (
                  <Input {...field} placeholder="Email" type="email" />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Country"
              name="country"
              validateStatus={errors.country ? "error" : ""}
              help={errors.country && errors.country.message}
              required={true}
            >
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <Input {...field} placeholder="Country" />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="State"
              name="state"
              validateStatus={errors.state ? "error" : ""}
              help={errors.state && errors.state.message}
              required={true}
            >
              <Controller
                control={control}
                name="state"
                render={({ field }) => <Input {...field} placeholder="State" />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="City"
              name="city"
              validateStatus={errors.city ? "error" : ""}
              help={errors.city && errors.city.message}
              required={true}
            >
              <Controller
                control={control}
                name="city"
                render={({ field }) => <Input {...field} placeholder="City" />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Pincode"
              name="pincode"
              validateStatus={errors.pincode ? "error" : ""}
              help={errors.pincode && errors.pincode.message}
              required={true}
            >
              <Controller
                control={control}
                name="pincode"
                render={({ field }) => (
                  <Input {...field} placeholder="Pincode" />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Bill Title"
              name="bill_title"
              validateStatus={errors.bill_title ? "error" : ""}
              help={errors.bill_title && errors.bill_title.message}
              required={true}
            >
              <Controller
                control={control}
                name="bill_title"
                render={({ field }) => (
                  <Input {...field} placeholder="Bill title" />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Company Type"
              name="company_types"
              validateStatus={errors.company_types ? "error" : ""}
              help={errors.company_types && errors.company_types.message}
              required={true}
            >
              <Controller
                control={control}
                name="company_types"
                render={({ field }) => (
                  <Select
                    mode="multiple"
                    allowClear
                    placeholder="Company type"
                    {...field}
                    options={[
                      {
                        label: "Sale",
                        value: "sale",
                      },
                      {
                        label: "Purchase",
                        value: "purchase",
                      },
                      {
                        label: "Production",
                        value: "production",
                      },
                    ]}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Addres Line 1"
              name="address_line_1"
              validateStatus={errors.address_line_1 ? "error" : ""}
              help={errors.address_line_1 && errors.address_line_1.message}
              required={true}
            >
              <Controller
                control={control}
                name="address_line_1"
                render={({ field }) => (
                  <Input {...field} placeholder="Addres Line 1" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Addres Line 2"
              name="address_line_2"
              validateStatus={errors.address_line_2 ? "error" : ""}
              help={errors.address_line_2 && errors.address_line_2.message}
            >
              <Controller
                control={control}
                name="address_line_2"
                render={({ field }) => (
                  <Input {...field} placeholder="Addres Line 2" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Bank Name"
              name="bank_name"
              validateStatus={errors.bank_name ? "error" : ""}
              help={errors.bank_name && errors.bank_name.message}
              required={true}
            >
              <Controller
                control={control}
                name="bank_name"
                render={({ field }) => (
                  <Input {...field} placeholder="Bank name" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="IFSC Code"
              name="ifsc_code"
              validateStatus={errors.ifsc_code ? "error" : ""}
              help={errors.ifsc_code && errors.ifsc_code.message}
              required={true}
            >
              <Controller
                control={control}
                name="ifsc_code"
                render={({ field }) => (
                  <Input {...field} placeholder="IFSC Code" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Account Number"
              name="account_number"
              validateStatus={errors.account_number ? "error" : ""}
              help={errors.account_number && errors.account_number.message}
              required={true}
            >
              <Controller
                control={control}
                name="account_number"
                render={({ field }) => (
                  <Input {...field} placeholder="Account number" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Account Type"
              name="account_type"
              validateStatus={errors.account_type ? "error" : ""}
              help={errors.account_type && errors.account_type.message}
              required={true}
            >
              <Controller
                control={control}
                name="account_type"
                render={({ field }) => (
                  <Select
                    placeholder="Account type"
                    {...field}
                    options={[
                      {
                        label: "Savings",
                        value: "SAVINGS",
                      },
                      {
                        label: "Current",
                        value: "CURRENT",
                      },
                    ]}
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

export default SignUp;
