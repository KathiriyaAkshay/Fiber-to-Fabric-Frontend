import { CloseOutlined, EditOutlined } from "@ant-design/icons";
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
import { useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePassbookRequest } from "../../../api/requests/accounts/payment";
import dayjs from "dayjs";

const EditPassBookEntryModal = ({ details }) => {
  const { companyId } = useContext(GlobalContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const { mutateAsync: updatePassBookEntry, isPending } = useMutation({
    mutationKey: ["update", "particular"],
    mutationFn: async (data) => {
      const res = await updatePassbookRequest({
        id: details.id,
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
      voucher_date: dayjs(data.voucher_date).format("YYYY-MM-DD"),
    };
    await updatePassBookEntry(payload);
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      voucher_date: null,
    },
  });

  useEffect(() => {
    if (details) {
      reset({
        voucher_date: dayjs(details.voucher_date),
      });
    }
  }, [details, reset]);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        <EditOutlined />
      </Button>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Edit Entry
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
        <Row gutter={12}>
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
        <Typography.Text style={{ fontSize: "12px", fontStyle: "italic" }}>
          * Voucher Date will effect in Cost Per Meter & Passbook *{" "}
        </Typography.Text>
        <Flex gap={10} style={{ marginTop: "1rem" }} justify="flex-end">
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
    </>
  );
};

export default EditPassBookEntryModal;
