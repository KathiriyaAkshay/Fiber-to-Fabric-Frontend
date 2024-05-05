import { ArrowLeftOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { Button, Col, Flex, Form, Input, Row, Select, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { createCompanyRequest } from "../../api/requests/company";
import PhoneInput from "react-phone-number-input";
import ForwardRefInput from "../../components/common/ForwardRefInput";

const createCompanySchemaResolver = yupResolver(
  yup.object().shape({
    owner_mobile: yup
      .string()
      .test("Mobile Validation", "Please enter valid Contact Number", (value) =>
        value ? isValidPhoneNumber(value) : false
      ),
    gst_no: yup.string().required("Please enter GST"),
    owner_name: yup.string().required(),
    company_name: yup.string().required(),
    pancard_no: yup.string().required(),
    adhar_no: yup.string().required(),
    company_unit: yup.string().required(),
    bill_number_format: yup.string().required(),
    company_email: yup.string().required(),
    company_contact: yup.string().required(),
    address_line_1: yup.string().required(),
    address_line_2: yup.string(),
    country: yup.string().required(),
    state: yup.string().required(),
    city: yup.string().required(),
    pincode: yup.string().required(),
    bill_title: yup.string().required(),
    bank_name: yup.string().required(),
    account_number: yup.string().required(),
    ifsc_code: yup.string().required(),
    company_types: yup
      .array()
      // .of(yup.string().oneOf(enumValues, "Invalid company type value"))
      .required("Enum array is required"),
    account_type: yup.string().required(),
  })
);

function AddCompany() {
  const navigate = useNavigate();
  function goBack() {
    navigate(-1);
  }

  const { mutateAsync: addNewCompany } = useMutation({
    mutationFn: async (data) => {
      const res = await createCompanyRequest(data);
      return res.data;
    },
    mutationKey: ["company", "create"],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
  });

  async function onSubmit(data) {
    console.log(data); // Handle form submission
    const res = await addNewCompany(data);
    console.log("res----->", res);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: createCompanySchemaResolver,
  });

  // console.log("errors----->", errors);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Add New Company</h3>
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
              label="GST No"
              name="gst_no"
              validateStatus={errors.gst_no ? "error" : ""}
              help={errors.gst_no && errors.gst_no.message}
              required={true}
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
              label="Owner Name"
              name="owner_name"
              validateStatus={errors.owner_name ? "error" : ""}
              help={errors.owner_name && errors.owner_name.message}
              required={true}
            >
              <Controller
                control={control}
                name="owner_name"
                render={({ field }) => (
                  <Input {...field} placeholder="Owner name" />
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
              label="Owner Mobile"
              name="owner_mobile"
              validateStatus={errors.owner_mobile ? "error" : ""}
              help={errors.owner_mobile && errors.owner_mobile.message}
              required={true}
            >
              <Controller
                control={control}
                name="owner_mobile"
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
              label="PAN No"
              name="pancard_no"
              validateStatus={errors.pancard_no ? "error" : ""}
              help={errors.pancard_no && errors.pancard_no.message}
              required={true}
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
              label="Aadhar No"
              name="adhar_no"
              validateStatus={errors.adhar_no ? "error" : ""}
              help={errors.adhar_no && errors.adhar_no.message}
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
              label="Company Contact"
              name="company_contact"
              validateStatus={errors.company_contact ? "error" : ""}
              help={errors.company_contact && errors.company_contact.message}
              required={true}
            >
              <Controller
                control={control}
                name="company_contact"
                render={({ field }) => (
                  <PhoneInput
                    {...field}
                    placeholder="9876543210"
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

          {/* <Form.Item
              label="Signature URL"
              name="signature_url"
              validateStatus={errors.signature_url ? "error" : ""}
              help={errors.signature_url && errors.signature_url.message}
            >
              <Controller
                control={control}
                name="signature_url"
                render={({ field }) => (
                  <Input {...field} placeholder="Signature URL" />
                )}
              />
            </Form.Item>

            <Form.Item
              label="Company Logo URL"
              name="company_logo_url"
              validateStatus={errors.company_logo_url ? "error" : ""}
              help={errors.company_logo_url && errors.company_logo_url.message}
            >
              <Controller
                control={control}
                name="company_logo_url"
                render={({ field }) => (
                  <Input {...field} placeholder="Company Logo URL" />
                )}
              />
            </Form.Item> */}
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

export default AddCompany;
