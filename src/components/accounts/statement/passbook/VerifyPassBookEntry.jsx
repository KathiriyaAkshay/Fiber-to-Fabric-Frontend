import { CloseOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  message,
  Modal,
  Row,
  Select,
  Typography,
} from "antd";
import { updatePassbookRequest } from "../../../../api/requests/accounts/payment";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const validationSchema = yupResolver(
  yup.object().shape({
    date: yup.string().required("Please enter voucher date."),
    bank_name: yup.string().required("Please enter remark."),
  })
);

const VerifyPassBookEntry = ({
  open,
  handleClose,
  row,
  companyId,
  company,
}) => {
  const queryClient = useQueryClient();

  const { mutateAsync: updatePassBookEntry, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await updatePassbookRequest({
        id: row.id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["update", "passbook", "entry", { companyId }],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "get",
        "passBook",
        "list",
        { company_id: companyId },
      ]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      handleClose();
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const onSubmit = async (data) => {
    const payload = {
      company_bank_id: +data.bank_name,
      // createdAt: dayjs(data.date).format("YYYY-MM-DD"),
      cheque_date: dayjs(data.date).format("YYYY-MM-DD"),
      is_verified: true,
    };

    await updatePassBookEntry(payload);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      date: dayjs(),
      bank_name: null,
    },
    resolver: validationSchema,
  });

  useEffect(() => {
    if (row) {
      reset({
        bank_name: row?.company_bank_id,
        date: dayjs(row.createdAt),
      });
    }
  }, [reset, row]);

  const bankOptions = useMemo(() => {
    if (company) {
      return company.company_bank_details.map(({ bank_name, id }) => {
        return { label: bank_name, value: id };
      });
    } else {
      return [];
    }
  }, [company]);

  return (
    <Modal
      closeIcon={<CloseOutlined className="text-white" />}
      title={
        <Typography.Text className="text-xl font-medium text-white">
          Alert
        </Typography.Text>
      }
      open={open}
      footer={null}
      onCancel={handleClose}
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
      <Typography style={{ fontSize: "16px", fontWeight: "600" }}>
        Are you sure to Verify this entry?
      </Typography>
      <Row
        gutter={18}
        style={{
          paddingTop: "12px",
        }}
      >
        <Col span={24}>
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

        <Col span={24}>
          <Form.Item
            label={"Select Bank"}
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
                    options={bankOptions}
                  />
                );
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Flex gap={10} justify="flex-end">
        <Button htmlType="button" onClick={handleClose}>
          Cancel
        </Button>

        <Button
          type="primary"
          htmlType="button"
          loading={isPending}
          onClick={handleSubmit(onSubmit)}
        >
          Confirm
        </Button>
      </Flex>
    </Modal>
  );
};

export default VerifyPassBookEntry;
