import { CloseOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Select,
  Typography,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { createCompanyBankRequest } from "../../api/requests/company";

const createCompanySchemaResolver = yupResolver(
  yup.object().shape({
    bank_name: yup.string().required("Please enter bank name"),
    account_number: yup.string().required("Please enter account number"),
    ifsc_code: yup.string().required("Please enter IFSC code"),
    account_type: yup.string().required("Please select account type"),
  })
);

function BankDetailModal({
  title = "Bank Details",
  open = true,
  onCancel = () => {},
  company = {},
}) {
  const { id: companyId } = company;

  const { mutateAsync: createCompanyBank } = useMutation({
    mutationFn: async (data) => {
      const res = await createCompanyBankRequest({
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["company", "bank-detail", "create"],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: createCompanySchemaResolver,
  });

  async function onSubmit(data) {
    await createCompanyBank(data);
    reset();
    onCancel();
  }

  return (
    <Modal
      closeIcon={<CloseOutlined className="text-white" />}
      title={
        <Typography.Text className="text-xl font-medium text-white">
          {title}
        </Typography.Text>
      }
      open={open}
      footer={null}
      onCancel={onCancel}
      centered={true}
      classNames={{
        header: "text-center",
      }}
      styles={{
        content: {
          padding: 0,
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
      <Flex className="flex-col gap-1">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label="Bank Name"
            name="bank_name"
            validateStatus={errors.bank_name ? "error" : ""}
            help={errors.bank_name && errors.bank_name.message}
          >
            <Controller
              control={control}
              name="bank_name"
              render={({ field }) => <Input {...field} placeholder="" />}
            />
          </Form.Item>

          <Form.Item
            label="Account Number"
            name="account_number"
            validateStatus={errors.account_number ? "error" : ""}
            help={errors.account_number && errors.account_number.message}
          >
            <Controller
              control={control}
              name="account_number"
              render={({ field }) => <Input {...field} placeholder="" />}
            />
          </Form.Item>

          <Form.Item
            label="IFSC Code"
            name="ifsc_code"
            validateStatus={errors.ifsc_code ? "error" : ""}
            help={errors.ifsc_code && errors.ifsc_code.message}
          >
            <Controller
              control={control}
              name="ifsc_code"
              render={({ field }) => <Input {...field} placeholder="" />}
            />
          </Form.Item>

          <Form.Item
            label="Account Type"
            name="account_type"
            validateStatus={errors.account_type ? "error" : ""}
            help={errors.account_type && errors.account_type.message}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name="account_type"
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select account type"
                  options={[
                    {
                      label: "Saving",
                      value: "SAVINGS",
                    },
                    {
                      label: "Current",
                      value: "CURRENT",
                    },
                    // {
                    //   label: "CC/OD",
                    //   value: "CC/OD",
                    // },
                  ]}
                />
              )}
            />
          </Form.Item>

          <Flex gap={10} justify="flex-end">
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </Flex>
        </Form>
      </Flex>
    </Modal>
  );
}

export default BankDetailModal;
