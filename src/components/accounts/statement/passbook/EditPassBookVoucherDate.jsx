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
  Typography,
} from "antd";
import { updatePassbookRequest } from "../../../../api/requests/accounts/payment";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const validationSchema = yupResolver(
  yup.object().shape({
    voucher_date: yup.string().required("Please enter voucher date."),
  })
);

const EditPassBookVoucherDate = ({ open, handleClose, row, companyId }) => {
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
      voucher_date: dayjs(data.voucher_date).format("YYYY-MM-DD"),
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
      voucher_date: dayjs(),
    },
    resolver: validationSchema,
  });

  useEffect(() => {
    if (row) {
      reset({
        voucher_date: dayjs(row.voucher_date),
      });
    }
  }, [reset, row]);

  return (
    <Modal
      closeIcon={<CloseOutlined className="text-white" />}
      title={
        <Typography.Text className="text-xl font-medium text-white">
          Update Vocher date
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
      <Row
        gutter={18}
        style={{
          paddingTop: "12px",
        }}
      >
        <Col span={24}>
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
                return <DatePicker {...field} style={{ width: "100%" }} />;
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
          Update
        </Button>
      </Flex>
    </Modal>
  );
};

export default EditPassBookVoucherDate;
