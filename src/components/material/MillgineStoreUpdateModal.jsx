import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Row,
  Typography,
} from "antd";
import { useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { GlobalContext } from "../../contexts/GlobalContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMellgineStoreUpdateRequest } from "../../api/requests/material";

const MillgineStoreUpdateModal = ({ details }) => {
  const { companyId } = useContext(GlobalContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const { mutateAsync: updateMillgineStore, isPending } = useMutation({
    mutationKey: ["update", "millgine-store"],
    mutationFn: async (data) => {
      const res = await updateMellgineStoreUpdateRequest({
        code: details.code,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ["get", "millgine", "list"],
      });
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
      used_quantity: +data.used_quantity,
      used_pis: +data.used_pis,
    };
    await updateMillgineStore(payload);
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      used_quantity: "",
      used_pis: "",
    },
  });

  useEffect(() => {
    if (details) {
      reset({
        used_quantity: details?.used_quantity || 0,
        used_pis: details?.used_pis || 0,
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
            Update
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
          <Col span={12}>
            <Form.Item
              label={"Used Quantity"}
              name="used_quantity"
              validateStatus={errors.used_quantity ? "error" : ""}
              help={errors.used_quantity && errors.used_quantity.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="used_quantity"
                render={({ field }) => {
                  return <Input {...field} />;
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={"Used Pcs"}
              name="used_pis"
              validateStatus={errors.used_pis ? "error" : ""}
              help={errors.used_pis && errors.used_pis.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="used_pis"
                render={({ field }) => {
                  return <Input {...field} />;
                }}
              />
            </Form.Item>
          </Col>
        </Row>

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

export default MillgineStoreUpdateModal;
