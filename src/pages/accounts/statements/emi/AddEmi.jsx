import { ArrowLeftOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Table,
  Typography,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getParticularListRequest } from "../../../../api/requests/accounts/particular";
import { PARTICULAR_OPTIONS } from "../../../../constants/account";
import dayjs from "dayjs";
import { calculateEmiRequest } from "../../../../api/requests/accounts/emi";

const LOAN_TYPE = [
  { label: "Term Loans", value: "term_loans" },
  { label: "Business", value: "business" },
  { label: "Personal Loan", value: "personal_loan" },
  { label: "Home Loan", value: "home_loan" },
  { label: "Car Loan", value: "car_loan" },
];

const PAYMENT_TYPE = [
  { label: "ECS", value: "ecs" },
  { label: "Cheque", value: "cheque" },
];

const PASSBOOK_ENTRY = [
  { label: "Verified", value: "verified" },
  { label: "Unverified", value: "unverified" },
];

const addYSCSchemaResolver = yupResolver(
  yup.object().shape({
    bank_name: yup.string().required("Please select bank name."),
    loan_type: yup.string().required("Please select loan type."),
    particular: yup.string().required("Please select particular."),
    loan_ac_number: yup.string().required("Please enter loan account number."),
    pending_emi: yup.string().required("Please enter pending EMI."),
    loan_amount: yup.string().required("Please enter loan amount."),
    emi_rate: yup.string().required("Please enter EMI rate"),
    due_date: yup.string().required("Please enter due date."),
    payment_type: yup.string().required("Please select payment type."),
    total_emi: yup.string().required("Please enter total EMI"),
    passbook_entry: yup.string().required("Please enter passbook entry"),
  })
);

const AddEmi = () => {
  const navigate = useNavigate();

  const [calculatedData, setCalculatedData] = useState([]);
  const { companyId, companyListRes } = useContext(GlobalContext);
  function goBack() {
    navigate(-1);
  }

  const [particularOptions, setParticularOptions] = useState([]);

  const bankOption = useMemo(() => {
    if (companyId && companyListRes) {
      const selectedCompany = companyListRes.rows.find(
        ({ id }) => id === companyId
      );
      if (selectedCompany && selectedCompany?.company_bank_details.length) {
        const bankOption = selectedCompany?.company_bank_details?.map(
          ({ bank_name, id, balance }) => {
            return { label: bank_name, value: id, balance };
          }
        );

        return bankOption;
      } else {
        return [];
      }
    } else {
      return [];
    }
  }, [companyId, companyListRes]);

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

  async function onSubmit(data) {
    try {
      const params = {
        company_id: companyId,
        pendingEMIs: data.pending_emi,
        loanAmount: data.loan_amount,
        emiRate: data.emi_rate,
        dueDate: dayjs(data.due_date).format("DD-MM-YYYY"),
        totalEMIs: data.total_emi,
        account_number: data.loan_ac_number,
      };

      const response = await calculateEmiRequest({ params });
      if (response.data.success) {
        setCalculatedData(response.data.data);
      } else {
        setCalculatedData([]);
      }
    } catch (error) {
      message.error(error.message);
      setCalculatedData([]);
    }
  }

  const saveHandler = async () => {
    const params = {
      company_id: companyId,
      pendingEMIs: getValues("pending_emi"),
      loanAmount: getValues("loan_amount"),
      emiRate: getValues("emi_rate"),
      dueDate: dayjs(getValues("due_date")).format("DD-MM-YYYY"),
      totalEMIs: getValues("total_emi"),
      account_number: getValues("loan_ac_number"),
      is_store: 1,
    };

    const response = await calculateEmiRequest({ params });

    if (response.data.success) {
      setCalculatedData(response.data.data);
      navigate("/account/statement/emi-loan");
    } else {
      setCalculatedData([]);
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
  } = useForm({
    defaultValues: {
      bank_name: null,
      loan_type: null,
      particular: null,
      loan_ac_number: "",
      pending_emi: "",
      loan_amount: "",
      emi_rate: "",
      due_date: dayjs(),
      payment_type: null,
      total_emi: "",
      passbook_entry: "",
    },
    resolver: addYSCSchemaResolver,
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

  // ------------------------------------------------------------------------------------------

  const selectedHeadName = useMemo(() => {
    const selectedParticular = particularOptions.find(
      (item) => item.value === particular
    );

    return selectedParticular?.head || "";
  }, [particular, particularOptions]);

  const columns = [
    {
      title: "Pending Emi",
      dataIndex: "pendingEMI",
      key: "pendingEMI",
    },
    {
      title: "Emi Date",
      dataIndex: "emiDate",
      key: "emiDate",
      render: (text) => text || "-",
    },
    {
      title: "Emi Amount",
      dataIndex: "emiAmount",
      key: "emiAmount",
      render: (text) => text || "-",
    },
    {
      title: "Principal Amount",
      dataIndex: "principalAmount",
      key: "principalAmount",
    },
    {
      title: "Interest Amount",
      dataIndex: "interestAmount",
      key: "interestAmount",
    },
    {
      title: "Principal Balance",
      dataIndex: "principalBalance",
      key: "principalBalance",
    },
  ];

  function renderTable() {
    // if (isLoadingPaymentList) {
    //   return (
    //     <
    // Spin tip="Loading" size="large">
    //       <div className="p-14" />
    //     </>
    //   );
    // }

    return (
      <Table
        dataSource={calculatedData || []}
        columns={columns}
        rowKey={"id"}
        scroll={{ y: 330 }}
        pagination={false}
      />
    );
  }
  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">EMI Calculation</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={6}>
            <Form.Item
              label="Bank"
              name="bank_name"
              validateStatus={errors.bank_name ? "error" : ""}
              help={errors.bank_name && errors.bank_name.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="bank_name"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select bank"
                    options={bankOption || []}
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

          <Col span={6}>
            <Form.Item
              label="Loan Type"
              name="loan_type"
              validateStatus={errors.loan_type ? "error" : ""}
              help={errors.loan_type && errors.loan_type.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="loan_type"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Loan Type"
                    options={LOAN_TYPE}
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
              label={"Particular"}
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
                      <Select
                        {...field}
                        showSearch
                        placeholder="Select Particular"
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
                    );
                  }}
                />
              </Flex>
              <Typography.Text style={{ color: "green" }}>
                {selectedHeadName}
              </Typography.Text>
            </Form.Item>
          </Col>
        </Row>

        <Row
          gutter={18}
          style={{
            padding: "0px 12px",
          }}
        >
          <Col span={6}>
            <Form.Item
              label="loan A/C Number"
              name="loan_ac_number"
              validateStatus={errors.loan_ac_number ? "error" : ""}
              help={errors.loan_ac_number && errors.loan_ac_number.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="loan_ac_number"
                render={({ field }) => (
                  <Input {...field} placeholder="41111111184434" />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Pending EMI"
              name="pending_emi"
              validateStatus={errors.pending_emi ? "error" : ""}
              help={errors.pending_emi && errors.pending_emi.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="pending_emi"
                render={({ field }) => <Input {...field} placeholder="12" />}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Loan amount"
              name="loan_amount"
              validateStatus={errors.loan_amount ? "error" : ""}
              help={errors.loan_amount && errors.loan_amount.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="loan_amount"
                render={({ field }) => <Input {...field} placeholder="12000" />}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="EMI rate (%)"
              name="emi_rate"
              validateStatus={errors.emi_rate ? "error" : ""}
              help={errors.emi_rate && errors.emi_rate.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="emi_rate"
                render={({ field }) => <Input {...field} placeholder="12" />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row
          gutter={18}
          style={{
            padding: "0px 12px",
          }}
        >
          <Col span={6}>
            <Form.Item
              label="Due Date"
              name="due_date"
              validateStatus={errors.due_date ? "error" : ""}
              help={errors.due_date && errors.due_date.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="due_date"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    style={{ width: "100%" }}
                    // disabledDate={disableBeforeDate}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Payment Type"
              name="payment_type"
              validateStatus={errors.payment_type ? "error" : ""}
              help={errors.payment_type && errors.payment_type.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="payment_type"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Payment Type"
                    options={PAYMENT_TYPE}
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

          <Col span={6}>
            <Form.Item
              label="Total EMI"
              name="total_emi"
              validateStatus={errors.total_emi ? "error" : ""}
              help={errors.total_emi && errors.total_emi.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="total_emi"
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Passbook Entry"
              name="passbook_entry"
              validateStatus={errors.passbook_entry ? "error" : ""}
              help={errors.passbook_entry && errors.passbook_entry.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="passbook_entry"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Passbook entry"
                    options={PASSBOOK_ENTRY}
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
        </Row>

        <Flex gap={10} justify="flex-end">
          <Button type="primary" htmlType="submit">
            Calculate
          </Button>
          {calculatedData && calculatedData.length ? (
            <Button type="primary" htmlType="button" onClick={saveHandler}>
              Save
            </Button>
          ) : null}
        </Flex>
      </Form>

      <br />
      {calculatedData && calculatedData.length ? renderTable() : null}
    </div>
  );
};

export default AddEmi;
