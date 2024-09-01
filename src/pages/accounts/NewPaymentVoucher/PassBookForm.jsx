import {
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Radio,
  Row,
  Select,
  Typography,
} from "antd";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import { CheckOutlined, EditOutlined } from "@ant-design/icons";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  ENTRY_TYPE_OPTIONS,
  HEAD_OPTIONS,
  PARTICULAR_OPTIONS,
} from "../../../constants/account";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createParticularRequest,
  getParticularListRequest,
} from "../../../api/requests/accounts/particular";
import {
  addPassbookRequest,
  getLastVoucherNoRequest,
} from "../../../api/requests/accounts/payment";
import EditPassBookParticular from "../../../components/accounts/payment/EditPassBookParticular";

const { TextArea } = Input;

const addBillValidationSchema = yupResolver(
  yup.object().shape({
    particular: yup.string().required("Please select particular."),
    entry_type: yup.string().required("Please select entry type."),
    // company_name: yup.string().required("Please select company."),
    bank_name: yup.string().required("Please enter bank name."),
    cheque_no: yup.string().required("Please enter cheque no."),
    cheque_date: yup.string().required("Please enter cheque date."),
    amount: yup.string().required("Please enter amount."),
    voucher_no: yup.string().required("Please enter voucher no."),
    voucher_date: yup.string().required("Please enter voucher date."),
    remark: yup.string().required("Please enter remark."),
    is_one_way: yup.string().required("Required."),
    passbook_entry: yup.string().required("Required."),
  })
);

const PassBookForm = () => {
  const { company, companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient();

  const [particularName, setParticularName] = useState("");
  const [headName, setHeadName] = useState(null);
  const [particularOptions, setParticularOptions] = useState([]);

  // get last voucher no API
  const { data: lastVoucherNo } = useQuery({
    queryKey: ["account/statement/last/voucher", { company_id: companyId }],
    queryFn: async () => {
      const res = await getLastVoucherNoRequest({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  // get particular list API
  const { data: particularRes, isLoading: isLoadingParticular } = useQuery({
    queryKey: [
      "dropdown/passbook_particular_type/list",
      { company_id: companyId },
    ],
    queryFn: async () => {
      const res = await getParticularListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  // create new particular API
  const { mutateAsync: addNewParticular, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await createParticularRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "particular", "new"],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "dropdown/passbook_particular_type/list",
        { company_id: companyId },
      ]);
      resetField("particular");
      setParticularName("");
      setHeadName(null);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const { mutateAsync: addNewPassBookEntry, isPending: isPendingPassBook } =
    useMutation({
      mutationFn: async (data) => {
        const res = await addPassbookRequest({
          data,
          params: {
            company_id: companyId,
          },
        });
        return res.data;
      },
      mutationKey: ["add", "passbook", "new"],
      onSuccess: (res) => {
        queryClient.invalidateQueries([
          "account/statement/last/voucher",
          { company_id: companyId },
        ]);
        const successMessage = res?.message;
        if (successMessage) {
          message.success(successMessage);
        }
        reset();
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || error.message;
        message.error(errorMessage);
      },
    });

  const onSubmit = async (data) => {
    const selectedParticular = particularOptions.find(
      ({ value }) => data.particular === value
    );

    const payload = {
      is_cost_per_meter: selectedParticular?.is_cost_per_meter,
      particular_type: data.particular,
      is_withdraw: data.entry_type === "withdrawal" ? true : false,
      company_bank_id: +data.bank_name,
      cheque_no: data.cheque_no,
      cheque_date: dayjs(data.cheque_date).format("YYYY-MM-DD"),
      voucher_no: data.voucher_no,
      voucher_date: dayjs(data.voucher_date).format("YYYY-MM-DD"),
      amount: +data.amount,
      remarks: data.remark,
      is_one_way: data.is_one_way === "one_way" ? true : false,
      passbook_entry: data.passbook_entry === "yes" ? true : false,
    };

    await addNewPassBookEntry(payload);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    resetField,
    setValue,
  } = useForm({
    defaultValues: {
      particular: null,
      entry_type: null,
      // company_name: null,
      bank_name: null,
      cheque_no: null,
      cheque_date: dayjs(),
      voucher_no: "",
      voucher_date: dayjs(),
      amount: "",
      remark: "",
      is_one_way: "one_way",
      passbook_entry: "yes",
    },
    resolver: addBillValidationSchema,
  });

  const { particular } = watch();

  useEffect(() => {
    if (particularRes) {
      const otherOption = {
        label: "OTHER",
        value: "other",
        is_cost_per_meter: false,
        color: "black",
      };

      const data = particularRes.rows.map(
        ({ particular_name, is_cost_per_meter, head }) => {
          return {
            label: particular_name,
            value: particular_name,
            color: "#000",
            is_cost_per_meter,
            head,
          };
        }
      );

      setParticularOptions([...PARTICULAR_OPTIONS, ...data, otherOption]);
    }
  }, [particularRes]);

  const selectedHeadName = useMemo(() => {
    const selectedParticular = particularOptions.find(
      (item) => item.value === particular
    );

    return selectedParticular?.head || "";
  }, [particular, particularOptions]);

  const bankOptions = useMemo(() => {
    if (company) {
      return company.company_bank_details.map(({ bank_name, id }) => {
        return { label: bank_name, value: id };
      });
    } else {
      return [];
    }
  }, [company]);

  const AddNewParticularHandler = async () => {
    if (!particularName || !headName) {
      message.error("All fields are required.");
      return;
    }

    const payload = {
      particular_name: particularName,
      head: headName,
    };
    await addNewParticular(payload);
  };

  useEffect(() => {
    if (lastVoucherNo && lastVoucherNo.length) {
      setValue("voucher_no", lastVoucherNo);
    } else {
      setValue("voucher_no", `V-1`);
    }
  }, [lastVoucherNo, setValue]);

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
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item
                  label={
                    <label>
                      Particular{" "}
                      <span style={{ color: "red", fontSize: "12px" }}>
                        (Orange color heads expenses will be calculated in cost
                        per meter)
                      </span>
                    </label>
                  }
                  name="particular"
                  validateStatus={errors.particular ? "error" : ""}
                  help={errors.particular && errors.particular.message}
                  wrapperCol={{ sm: 24 }}
                  required
                >
                  <Flex gap={6}>
                    <Controller
                      control={control}
                      name="particular"
                      render={({ field }) => {
                        return (
                          <>
                            <Select
                              {...field}
                              showSearch
                              placeholder="Select Type"
                              allowClear
                              loading={isLoadingParticular}
                            >
                              {particularOptions?.map((option) => (
                                <Select.Option
                                  key={option.value}
                                  value={option.value}
                                  style={{ color: option.color }}
                                >
                                  {option.label}
                                </Select.Option>
                              ))}
                            </Select>
                          </>
                        );
                      }}
                    />
                    {/* <Button type="primary">
                      <EditOutlined />
                    </Button> */}
                    <EditPassBookParticular />
                  </Flex>
                  <Typography.Text style={{ color: "green" }}>
                    {selectedHeadName}
                  </Typography.Text>
                </Form.Item>
              </Col>
            </Row>

            {particular && particular?.toLowerCase() === "other" && (
              <Row gutter={10} style={{ justifyContent: "flex-start" }}>
                <Col span={11}>
                  <Form.Item name="other_particular" wrapperCol={{ sm: 24 }}>
                    <Input
                      name="other_particular"
                      placeholder="Type name"
                      value={particularName}
                      onChange={(e) => setParticularName(e.target.value)}
                    />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item name="head" wrapperCol={{ sm: 24 }}>
                    <Select
                      name="head"
                      showSearch
                      placeholder="Select sub head"
                      options={HEAD_OPTIONS}
                      value={headName}
                      onChange={(selectedValue) => setHeadName(selectedValue)}
                    />
                  </Form.Item>
                </Col>
                <Col span={2}>
                  <Button
                    type="primary"
                    onClick={AddNewParticularHandler}
                    loading={isPending}
                  >
                    {isPending ? null : <CheckOutlined />}
                  </Button>
                </Col>
              </Row>
            )}

            <Row gutter={12}>
              <Col span={24}>
                <Form.Item
                  label={"Entry Type"}
                  name="entry_type"
                  validateStatus={errors.entry_type ? "error" : ""}
                  help={errors.entry_type && errors.entry_type.message}
                  wrapperCol={{ sm: 24 }}
                  required
                >
                  <Controller
                    control={control}
                    name="entry_type"
                    render={({ field }) => {
                      return (
                        <Select
                          {...field}
                          placeholder="Entry Type"
                          options={ENTRY_TYPE_OPTIONS}
                        />
                      );
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={12}>
              {/* <Col span={12}>
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
                          allowClear
                        />
                      );
                    }}
                  />
                </Form.Item>
              </Col> */}
              <Col span={24}>
                <Form.Item
                  label={"Bank Name"}
                  name="bank_name"
                  validateStatus={errors.bank_name ? "error" : ""}
                  help={errors.bank_name && errors.bank_name.message}
                  wrapperCol={{ sm: 24 }}
                  required
                >
                  <Controller
                    control={control}
                    name="bank_name"
                    render={({ field }) => {
                      return (
                        <Select
                          {...field}
                          placeholder="Select Bank"
                          allowClear
                          options={bankOptions}
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
              name="is_one_way"
              validateStatus={errors.is_one_way ? "error" : ""}
              help={errors.is_one_way && errors.is_one_way.message}
              wrapperCol={{ sm: 24 }}
              required
            >
              <Controller
                control={control}
                name="is_one_way"
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
              name="passbook_entry"
              validateStatus={errors.passbook_entry ? "error" : ""}
              help={errors.passbook_entry && errors.passbook_entry.message}
              wrapperCol={{ sm: 24 }}
              required
            >
              <Controller
                control={control}
                name="passbook_entry"
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
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isPendingPassBook}
                >
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
