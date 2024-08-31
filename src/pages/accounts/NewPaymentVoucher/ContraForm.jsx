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
} from "antd";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { CheckOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { addPartnerRequest } from "../../../api/requests/accounts/partner";
import { addContractRequest } from "../../../api/requests/accounts/payment";

const { TextArea } = Input;

const addContraValidationSchema = yupResolver(
  yup.object().shape({
    from_company: yup.string().required("Please select from company."),
    to_company: yup.string().required("Please select to company."),
    from_bank: yup.string().required("Please select from bank."),
    to_bank: yup.string().required("Please select to bank."),
    available_balance_1: yup
      .string()
      .required("Please enter available balance."),
    available_balance_2: yup
      .string()
      .required("Please enter available balance."),
    from_remark: yup.string().required("Please enter from remark."),
    to_remark: yup.string().required("Please enter to remark."),
    amount: yup.string().required("Please enter amount."),
    date: yup.date().required("Please enter date."),
    is_transfer_to_company: yup.string().required("Required."),
  })
);

const ContraForm = () => {
  const { companyListRes, companyId } = useContext(GlobalContext);
  const [partnerOptions, setPartnerOptions] = useState([]);
  const [partnerName, setPartnerName] = useState("");

  // create new particular API
  const { mutateAsync: addNewPartner, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await addPartnerRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "particular", "new"],
    onSuccess: (res) => {
      // queryClient.invalidateQueries([
      //   "dropdown/passbook_particular_type/list",
      //   { company_id: companyId },
      // ]);
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

  const { mutateAsync: addContractEntry, isPending: isPendingContract } =
    useMutation({
      mutationFn: async (data) => {
        const res = await addContractRequest({
          data,
          params: {
            company_id: companyId,
          },
        });
        return res.data;
      },
      mutationKey: ["add", "contract", "new"],
      onSuccess: (res) => {
        reset();
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

  const onSubmit = async (data) => {
    const payload = {
      company_id: +data?.from_company,
      bank_id: +data?.from_bank,
      bank_balance: +data?.available_balance_1,
      from_remark: data?.from_remark,
      is_transfer_to_company:
        data?.is_transfer_to_company === "true" ? true : false,
      sent_amount: +data.amount,
      to_remark: data?.to_remark,
    };

    if (data.is_transfer_to_company) {
      payload["to_company_id"] = +data.to_company;
      payload["to_bank_id"] = +data.to_bank;
      payload["to_bank_balance"] = +data.available_balance_2;
    } else {
      payload["company_partner_id"] = +data.to_partner;
    }

    await addContractEntry(payload);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      from_company: null,
      from_bank: null,
      to_company: null,
      to_bank: null,
      available_balance_1: "",
      available_balance_2: "",
      from_remark: "",
      to_remark: "",
      amount: "",
      date: dayjs(),
      is_transfer_to_company: true,

      to_partner: null,
    },
    resolver: addContraValidationSchema,
  });

  const {
    from_company,
    to_company,
    is_transfer_to_company,
    to_partner,
    from_bank,
    to_bank,
  } = watch();

  const fromBankOption = useMemo(() => {
    // resetField("from_bank");
    if (from_company && companyListRes) {
      const selectedCompany = companyListRes.rows.find(
        ({ id }) => id === from_company
      );
      if (selectedCompany && selectedCompany?.company_bank_details.length) {
        const bankOption = selectedCompany?.company_bank_details
          ?.filter(({ id }) => id !== to_bank)
          ?.map(({ bank_name, id, balance }) => {
            return { label: bank_name, value: id, balance };
          });

        return bankOption;
      } else {
        return [];
      }
    } else {
      return [];
    }
  }, [companyListRes, from_company, to_bank]);

  const toBankOption = useMemo(() => {
    // resetField("to_bank");
    if (to_company && companyListRes) {
      const selectedCompany = companyListRes.rows.find(
        ({ id }) => id === to_company
      );
      if (selectedCompany && selectedCompany?.company_bank_details.length) {
        const bankOption = selectedCompany?.company_bank_details
          ?.filter(({ id }) => id !== from_bank)
          ?.map(({ bank_name, id, balance }) => {
            return { label: bank_name, value: id, balance };
          });

        return bankOption;
      } else {
        return [];
      }
    } else {
      return [];
    }
  }, [companyListRes, from_bank, to_company]);

  const AddPartnerHandler = async () => {
    if (!partnerName) {
      message.error("All fields are required.");
      return;
    }

    const payload = {
      first_name: partnerName,
    };
    await addNewPartner(payload);
  };

  useEffect(() => {
    setPartnerOptions([{ label: "Other", value: "other" }]);
  }, []);

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
                      allowClear
                      options={companyListRes?.rows?.map(
                        ({ company_name, id }) => {
                          return { label: company_name, value: id };
                        }
                      )}
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={"From Bank"}
              name="from_bank"
              validateStatus={errors.from_bank ? "error" : ""}
              help={errors.from_bank && errors.from_bank.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="from_bank"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      showSearch
                      placeholder="Select Bank"
                      allowClear
                      options={fromBankOption}
                      onChange={(selectedValue) => {
                        field.onChange(selectedValue);
                        const selectedBank = fromBankOption.find(
                          ({ value }) => value === selectedValue
                        );
                        setValue(
                          "available_balance_1",
                          selectedBank?.balance || 0
                        );
                      }}
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
                  return <Input {...field} readOnly placeholder="0" />;
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
                  return (
                    <TextArea {...field} rows={1} placeholder="For test" />
                  );
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Flex
          style={{
            border: "1px solid #ccc",
            borderRadius: "6px",
            justifyContent: "center",
          }}
        >
          <Form.Item
            // label={"Remark (Printed on cheque)"}
            name="is_transfer_to_company"
            validateStatus={errors.is_transfer_to_company ? "error" : ""}
            help={
              errors.is_transfer_to_company &&
              errors.is_transfer_to_company.message
            }
            wrapperCol={{ sm: 24 }}
            style={{ margin: "12px 0px" }}
            required
          >
            <Controller
              control={control}
              name="is_transfer_to_company"
              render={({ field }) => {
                return (
                  <Radio.Group {...field}>
                    <Radio value={true}>To Company</Radio>
                    <Radio value={false}>To Partner</Radio>
                  </Radio.Group>
                );
              }}
            />
          </Form.Item>
        </Flex>

        {is_transfer_to_company ? (
          <>
            <Row style={{ padding: "12px 0px" }} gutter={12}>
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
                          allowClear
                          options={companyListRes?.rows?.map(
                            ({ company_name, id }) => {
                              return { label: company_name, value: id };
                            }
                          )}
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
                          allowClear
                          options={toBankOption}
                          onChange={(selectedValue) => {
                            field.onChange(selectedValue);
                            const selectedBank = toBankOption.find(
                              ({ value }) => value === selectedValue
                            );
                            setValue(
                              "available_balance_2",
                              selectedBank?.balance || 0
                            );
                          }}
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
                    errors.available_balance_2 &&
                    errors.available_balance_2.message
                  }
                  wrapperCol={{ sm: 24 }}
                  required
                >
                  <Controller
                    control={control}
                    name="available_balance_2"
                    render={({ field }) => {
                      return <Input {...field} readOnly placeholder="0" />;
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        ) : (
          <>
            <Row style={{ padding: "12px 0px" }} gutter={12}>
              <Col span={24}>
                <Form.Item
                  label={"To Partner"}
                  name="to_partner"
                  validateStatus={errors.to_partner ? "error" : ""}
                  help={errors.to_partner && errors.to_partner.message}
                  wrapperCol={{ sm: 24 }}
                >
                  <Flex gap={6}>
                    <Controller
                      control={control}
                      name="to_partner"
                      render={({ field }) => {
                        return (
                          <Select
                            {...field}
                            showSearch
                            placeholder="Select Partner"
                            allowClear
                            // loading={isLoadingParticular}
                            options={partnerOptions}
                          ></Select>
                        );
                      }}
                    />
                  </Flex>
                </Form.Item>
              </Col>
            </Row>

            {to_partner && to_partner?.toLowerCase() === "other" && (
              <Row gutter={10} style={{ justifyContent: "flex-start" }}>
                <Col span={22}>
                  <Form.Item name="other_particular" wrapperCol={{ sm: 24 }}>
                    <Input
                      name="partner_name"
                      placeholder="Partner name"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                    />
                  </Form.Item>
                </Col>
                <Col span={2}>
                  <Button
                    type="primary"
                    onClick={AddPartnerHandler}
                    loading={isPending}
                  >
                    {isPending ? null : <CheckOutlined />}
                  </Button>
                </Col>
              </Row>
            )}
          </>
        )}

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
                  return <Input {...field} placeholder="0" />;
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
                    <TextArea {...field} rows={1} placeholder="For test" />
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
          <Button type="primary" htmlType="submit" loading={isPendingContract}>
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
