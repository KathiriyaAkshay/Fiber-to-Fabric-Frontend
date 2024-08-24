import {
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Radio,
  Row,
  Select,
} from "antd";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import { EditOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const addBillValidationSchema = yupResolver(
  yup.object().shape({
    particular: yup.string().required("Please select particular."),
    entry_type: yup.string().required("Please select entry type."),
    // account_name: yup.string().required("Please select account name."),
    company_name: yup.string().required("Please select company."),
    bank_name: yup.string().required("Please enter bank name."),
    cheque_no: yup.string().required("Please enter cheque no."),
    cheque_date: yup.string().required("Please enter cheque date."),
    amount: yup.string().required("Please enter amount."),
    voucher_no: yup.string().required("Please enter voucher no."),
    voucher_date: yup.string().required("Please enter voucher date."),
    remark: yup.string().required("Please enter remark."),
    selection: yup.string().required("Required."),
    create_entry: yup.string().required("Required."),
  })
);

const PassBookForm = () => {
  const onSubmit = () => {
    console.log("Form submitted");
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      particular: null,
      entry_type: null,
      company_name: null,
      bank_name: null,
      cheque_no: null,
      cheque_date: null,
      voucher_no: "",
      voucher_date: dayjs(),
      amount: "",
      remark: "",
      selection: "one_way",
      create_entry: "yes",
    },
    resolver: addBillValidationSchema,
  });

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Row gutter={12} style={{ padding: "12px" }}>
        <Col span={8}>
          <Card
            style={{
              borderColor: "#194A6D",
              height: "100%",
            }}
          >
            <Form.Item
              label={
                <label>
                  Particular{" "}
                  <span style={{ color: "red", fontSize: "12px" }}>
                    (Orange color heads expenses will be calculated in cost per
                    meter)
                  </span>
                </label>
              }
              name="particular"
              validateStatus={errors.particular ? "error" : ""}
              help={errors.particular && errors.particular.message}
              wrapperCol={{ sm: 24 }}
            >
              <Flex gap={6}>
                <Controller
                  control={control}
                  name="particular"
                  render={({ field }) => {
                    return (
                      <Select
                        {...field}
                        showSearch
                        placeholder="Select Type"
                        labelInValue
                        allowClear
                      />
                    );
                  }}
                />
                <Button type="primary">
                  <EditOutlined />
                </Button>
              </Flex>
            </Form.Item>

            <Form.Item
              label={"Entry Type"}
              name="entry_type"
              validateStatus={errors.entry_type ? "error" : ""}
              help={errors.entry_type && errors.entry_type.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="entry_type"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      showSearch
                      placeholder="Entry Type"
                      labelInValue
                      allowClear
                    />
                  );
                }}
              />
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  label={"Company Name"}
                  name="company_name"
                  validateStatus={errors.company_name ? "error" : ""}
                  help={errors.company_name && errors.company_name.message}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="company_name"
                    render={({ field }) => {
                      return (
                        <Select
                          {...field}
                          showSearch
                          placeholder="Select Company"
                          labelInValue
                          allowClear
                        />
                      );
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={"Bank Name"}
                  name="bank_name"
                  validateStatus={errors.bank_name ? "error" : ""}
                  help={errors.bank_name && errors.bank_name.message}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="bank_name"
                    render={({ field }) => {
                      return (
                        <Select
                          {...field}
                          showSearch
                          placeholder="Select Bank"
                          labelInValue
                          allowClear
                        />
                      );
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            style={{
              borderColor: "#194A6D",
              height: "100%",
            }}
          >
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item
                  label={"Cheque No."}
                  name="cheque_no"
                  validateStatus={errors.cheque_no ? "error" : ""}
                  help={errors.cheque_no && errors.cheque_no.message}
                  wrapperCol={{ sm: 24 }}
                  required
                >
                  <Controller
                    control={control}
                    name="cheque_no"
                    render={({ field }) => {
                      return (
                        <Input {...field} showSearch placeholder="001245" />
                      );
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item
                  label={"Cheque Date"}
                  name="cheque_date"
                  validateStatus={errors.cheque_date ? "error" : ""}
                  help={errors.cheque_date && errors.cheque_date.message}
                  wrapperCol={{ sm: 24 }}
                  required
                >
                  <Controller
                    control={control}
                    name="cheque_date"
                    render={({ field }) => {
                      return (
                        <DatePicker {...field} style={{ width: "100%" }} />
                      );
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  label={"Voucher No."}
                  name="voucher_no"
                  validateStatus={errors.voucher_no ? "error" : ""}
                  help={errors.voucher_no && errors.voucher_no.message}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="voucher_no"
                    render={({ field }) => {
                      return <Input {...field} readOnly placeholder="001245" />;
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={"Voucher Date"}
                  name="voucher_date"
                  validateStatus={errors.voucher_date ? "error" : ""}
                  help={errors.voucher_date && errors.voucher_date.message}
                  wrapperCol={{ sm: 24 }}
                  required
                >
                  <Controller
                    control={control}
                    name="voucher_date"
                    render={({ field }) => {
                      return (
                        <DatePicker {...field} style={{ width: "100%" }} />
                      );
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            style={{
              borderColor: "#194A6D",
              height: "100%",
            }}
          >
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item
                  label={"Amount"}
                  name="amount"
                  validateStatus={errors.amount ? "error" : ""}
                  help={errors.amount && errors.amount.message}
                  wrapperCol={{ sm: 24 }}
                  required
                >
                  <Controller
                    control={control}
                    name="amount"
                    render={({ field }) => {
                      return <Input {...field} placeholder="0" />;
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={12}>
              <Col span={24}>
                <Form.Item
                  label={"Remark"}
                  name="remark"
                  validateStatus={errors.remark ? "error" : ""}
                  help={errors.remark && errors.remark.message}
                  wrapperCol={{ sm: 24 }}
                  required
                >
                  <Controller
                    control={control}
                    name="remark"
                    render={({ field }) => {
                      return (
                        <TextArea
                          {...field}
                          rows={1}
                          placeholder="Enter remark"
                        />
                      );
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              // label={"Remark (Printed on cheque)"}
              name="selection"
              validateStatus={errors.selection ? "error" : ""}
              help={errors.selection && errors.selection.message}
              wrapperCol={{ sm: 24 }}
              required
            >
              <Controller
                control={control}
                name="selection"
                render={({ field }) => {
                  return (
                    <Radio.Group {...field}>
                      <Radio value="one_way">One Way</Radio>
                      <Radio value="return">Return</Radio>
                    </Radio.Group>
                  );
                }}
              />
            </Form.Item>

            <Form.Item
              label={"Do you want to create Entry in Passbook Statement?"}
              name="create_entry"
              validateStatus={errors.create_entry ? "error" : ""}
              help={errors.create_entry && errors.create_entry.message}
              wrapperCol={{ sm: 24 }}
              required
            >
              <Controller
                control={control}
                name="create_entry"
                render={({ field }) => {
                  return (
                    <Radio.Group {...field}>
                      <Radio value="yes">Yes</Radio>
                      <Radio value="no">No</Radio>
                    </Radio.Group>
                  );
                }}
              />
              <Flex gap={10} justify="flex-end">
                <Button htmlType="button" onClick={() => reset()}>
                  Reset
                </Button>
                <Button type="primary" htmlType="submit">
                  Create
                </Button>
              </Flex>
            </Form.Item>
          </Card>
        </Col>
      </Row>
    </Form>
  );
};

export default PassBookForm;
