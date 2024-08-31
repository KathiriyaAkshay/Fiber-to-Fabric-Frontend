import { CloseOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useContext, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { GlobalContext } from "../../contexts/GlobalContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOpeningBalanceRequest } from "../../api/requests/company";

const ACCOUNT_TYPE_OPTION = [
  { label: "CC/OD", value: "cc/od" },
  { label: "Current", value: "current" },
];

const ADD_OPTION = [
  { label: "+", value: true },
  { label: "-", value: false },
];

const OpeningBalance = () => {
  const { companyListRes } = useContext(GlobalContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const { mutateAsync: addOpeningBalance, isPending } = useMutation({
    mutationKey: ["add", "opening", "balance"],
    mutationFn: async ({ data, companyId }) => {
      const res = await createOpeningBalanceRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(["company", "list"]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      handleCancel();
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const onSubmit = async (data) => {
    const payload = {
      bank_id: +data.bank_id,
      account_type: data.account_type,
      createdAt: dayjs(data.entry_date).format("YYYY-MM-DD"),
    };

    if (account_type === "cc/od") {
      payload["limit"] = +data.limit;
      payload["is_add"] = data.is_add;
      payload["current_value"] = +data.current_value_1;
    } else if (account_type === "current") {
      payload["current_value"] = +data.current_value_2;
    }
    await addOpeningBalance({ data: payload, companyId: data.company_id });
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      company_id: null,
      entry_date: dayjs(),
      bank_id: null,
      account_type: "cc/od",
      limit: "",
      current_value_1: "",
      current_value_2: "",
      is_add: true,
    },
  });

  const { account_type, company_id } = watch();

  const bankOptions = useMemo(() => {
    if (company_id) {
      const selectedCompany = companyListRes.rows.find(
        ({ id }) => id === company_id
      );
      return selectedCompany.company_bank_details.map((bank) => {
        return { label: bank.bank_name, value: bank.id };
      });
    } else {
      return [];
    }
  }, [companyListRes, company_id]);

  return (
    <>
      <Button type="primary" onClick={() => setIsModalOpen(true)}>
        Opening Balance
      </Button>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Opening Balance
          </Typography.Text>
        }
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        centered={true}
        className="view-in-house-quality-model"
        classNames={{
          header: "text-center",
        }}
        styles={{
          content: {
            padding: 0,
            width: "600px",
            margin: "auto",
          },
          header: {
            padding: "16px",
            margin: 0,
          },
          body: {
            padding: "10px 16px",
          },
        }}
      >
        <Form layout="vertical">
          <Row
            gutter={18}
            style={{
              padding: "12px",
            }}
          >
            <Col span={24}>
              <Form.Item
                label="Entry Date"
                name="entry_date"
                validateStatus={errors.entry_date ? "error" : ""}
                help={errors.entry_date && errors.entry_date.message}
              >
                <Controller
                  control={control}
                  name="entry_date"
                  render={({ field }) => (
                    <DatePicker {...field} style={{ width: "100%" }} />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Company"
                name="company_id"
                validateStatus={errors.company_id ? "error" : ""}
                help={errors.company_id && errors.company_id.message}
              >
                <Controller
                  control={control}
                  name="company_id"
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select company"
                      options={companyListRes?.rows?.map(
                        ({ id, company_name }) => {
                          return { label: company_name, value: id };
                        }
                      )}
                    />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Bank"
                name="bank_id"
                validateStatus={errors.bank_id ? "error" : ""}
                help={errors.bank_id && errors.bank_id.message}
              >
                <Controller
                  control={control}
                  name="bank_id"
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select bank"
                      options={bankOptions}
                    />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Select Type"
                name="account_type"
                validateStatus={errors.account_type ? "error" : ""}
                help={errors.account_type && errors.account_type.message}
              >
                <Controller
                  control={control}
                  name="account_type"
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select account type"
                      options={ACCOUNT_TYPE_OPTION}
                    />
                  )}
                />
              </Form.Item>
            </Col>

            {account_type === "cc/od" ? (
              <>
                <Col span={8}>
                  <Form.Item
                    label="Limit"
                    name="limit"
                    validateStatus={errors.limit ? "error" : ""}
                    help={errors.limit && errors.limit.message}
                  >
                    <Controller
                      control={control}
                      name="limit"
                      render={({ field }) => <Input {...field} />}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label=" "
                    name="is_add"
                    validateStatus={errors.is_add ? "error" : ""}
                    help={errors.is_add && errors.is_add.message}
                  >
                    <Controller
                      control={control}
                      name="is_add"
                      render={({ field }) => (
                        <Select {...field} options={ADD_OPTION} />
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Current"
                    name="current_value_1"
                    validateStatus={errors.current_value_1 ? "error" : ""}
                    help={
                      errors.current_value_1 && errors.current_value_1.message
                    }
                  >
                    <Controller
                      control={control}
                      name="current_value_1"
                      render={({ field }) => <Input {...field} />}
                    />
                  </Form.Item>
                </Col>
              </>
            ) : (
              <Col span={24}>
                <Form.Item
                  label="Current"
                  name="current_value_2"
                  validateStatus={errors.current_value_2 ? "error" : ""}
                  help={
                    errors.current_value_2 && errors.current_value_2.message
                  }
                >
                  <Controller
                    control={control}
                    name="current_value_2"
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={handleCancel}>
            Cancel
          </Button>

          <Button
            type="primary"
            htmlType="button"
            loading={isPending}
            onClick={handleSubmit(onSubmit)}
          >
            Save
          </Button>
        </Flex>
      </Modal>
    </>
  );
};

export default OpeningBalance;
