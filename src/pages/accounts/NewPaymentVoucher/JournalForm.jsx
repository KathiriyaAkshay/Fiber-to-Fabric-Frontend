import {
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
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
    company: yup.string().required("Please select company."),
    from_particular: yup.string().required("Please select from particular."),
    to_particular: yup.string().required("Please select To particular."),
    remark: yup.string().required("Please enter remark."),
    amount: yup.string().required("Please enter amount."),
    date: yup.date().required("Please enter date."),
    voucher_no: yup.string().required("Please enter voucher no."),
  })
);

const JournalForm = () => {
  const onSubmit = () => {
    console.log("Form submitted");
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      company: null,
      from_particular: null,
      to_particular: null,
      remark: "",
      amount: "",
      date: dayjs(),
      voucher_no: "",
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
          <Col span={8}>
            <Form.Item
              label={"Company"}
              name="company"
              validateStatus={errors.company ? "error" : ""}
              help={errors.company && errors.company.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="company"
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
          <Col span={8}>
            <Form.Item
              label={"From Particular"}
              name="from_particular"
              validateStatus={errors.from_particular ? "error" : ""}
              help={errors.from_particular && errors.from_particular.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="from_particular"
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
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={"To Particular"}
              name="to_particular"
              validateStatus={errors.to_particular ? "error" : ""}
              help={errors.to_particular && errors.to_particular.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="to_particular"
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
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={8}>
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
          <Col span={8}>
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
          <Col span={8}>
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
                    <TextArea {...field} rows={1} placeholder="Hello test..." />
                  );
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              label={"Voucher No"}
              name="voucher_no"
              validateStatus={errors.voucher_no ? "error" : ""}
              help={errors.voucher_no && errors.voucher_no.message}
              wrapperCol={{ sm: 24 }}
              required
            >
              <Controller
                control={control}
                name="voucher_no"
                render={({ field }) => {
                  return <Input {...field} placeholder="V-12" />;
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

export default JournalForm;
