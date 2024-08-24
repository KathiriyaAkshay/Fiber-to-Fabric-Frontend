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

const { TextArea } = Input;

const addContraValidationSchema = yupResolver(
  yup.object().shape({
    from_company: yup.string().required("Please select from company."),
    to_company: yup.string().required("Please select to company."),
    form_bank: yup.string().required("Please select from bank."),
    to_bank: yup.string().required("Please select to bank."),
    available_balance_1: yup
      .string()
      .required("Please enter available balance."),
    available_balance_2: yup
      .string()
      .required("Please enter available balance."),
    from_remark: yup.date().required("Please enter from remark."),
    to_remark: yup.string().required("Please enter to remark."),
    amount: yup.string().required("Please enter amount."),
    date: yup.date().required("Please enter date."),
    selection: yup.string().required("Required."),
  })
);

const ContraForm = () => {
  const onSubmit = () => {
    console.log("Form submitted");
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      from_company: null,
      form_bank: null,
      to_company: null,
      to_bank: null,
      available_balance_1: "",
      available_balance_2: "",
      from_remark: "",
      to_remark: "",
      amount: "",
      date: dayjs(),
      selection: "to_company",
    },
    resolver: addContraValidationSchema,
  });

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      {/* <Row gutter={12} style={{ padding: "12px" }}> */}
      {/* <Col span={12}> */}
      <Card
        style={{
          borderColor: "#194A6D",
          height: "auto",
          maxWidth: "50%",
          margin: "auto",
        }}
      >
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label={"From Company"}
              name="from_company"
              validateStatus={errors.from_company ? "error" : ""}
              help={errors.from_company && errors.from_company.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="from_company"
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
              label={"From Bank"}
              name="form_bank"
              validateStatus={errors.form_bank ? "error" : ""}
              help={errors.form_bank && errors.form_bank.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="form_bank"
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

        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              label={"Available Balance"}
              name="available_balance_1"
              validateStatus={errors.available_balance_1 ? "error" : ""}
              help={
                errors.available_balance_1 && errors.available_balance_1.message
              }
              wrapperCol={{ sm: 24 }}
              required
            >
              <Controller
                control={control}
                name="available_balance_1"
                render={({ field }) => {
                  return <Input {...field} placeholder="0" readOnly />;
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              label={"From Remark"}
              name="from_remark"
              validateStatus={errors.from_remark ? "error" : ""}
              help={errors.from_remark && errors.from_remark.message}
              wrapperCol={{ sm: 24 }}
              required
            >
              <Controller
                control={control}
                name="from_remark"
                render={({ field }) => {
                  return <Input {...field} placeholder="Hello test..." />;
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
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
                      <Radio value="to_company">To Company</Radio>
                      <Radio value="to_partner">To Partner</Radio>
                    </Radio.Group>
                  );
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label={"To Company"}
              name="to_company"
              validateStatus={errors.to_company ? "error" : ""}
              help={errors.to_company && errors.to_company.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="to_company"
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
              label={"To Bank"}
              name="to_bank"
              validateStatus={errors.to_bank ? "error" : ""}
              help={errors.to_bank && errors.to_bank.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="to_bank"
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

        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              label={"Available Balance"}
              name="available_balance_2"
              validateStatus={errors.available_balance_2 ? "error" : ""}
              help={
                errors.available_balance_2 && errors.available_balance_2.message
              }
              wrapperCol={{ sm: 24 }}
              required
            >
              <Controller
                control={control}
                name="available_balance_2"
                render={({ field }) => {
                  return <Input {...field} placeholder="0" readOnly />;
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
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
                  return <Input {...field} placeholder="0" readOnly />;
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={"Date"}
              name="date"
              validateStatus={errors.date ? "error" : ""}
              help={errors.date && errors.date.message}
              wrapperCol={{ sm: 24 }}
              required
            >
              <Controller
                control={control}
                name="date"
                render={({ field }) => {
                  return <DatePicker {...field} style={{ width: "100%" }} />;
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              label={"To Remark"}
              name="to_remark"
              validateStatus={errors.to_remark ? "error" : ""}
              help={errors.to_remark && errors.to_remark.message}
              wrapperCol={{ sm: 24 }}
              required
            >
              <Controller
                control={control}
                name="to_remark"
                render={({ field }) => {
                  return (
                    <TextArea {...field} rows={3} placeholder="For test" />
                  );
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Flex gap={10} justify="flex-end">
          {/* <Button htmlType="button" onClick={() => reset()}>
            Reset
          </Button> */}
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Flex>
      </Card>
      {/* </Col> */}

      {/* </Row> */}
    </Form>
  );
};

export default ContraForm;
