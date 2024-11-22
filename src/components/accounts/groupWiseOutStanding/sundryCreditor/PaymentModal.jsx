import { CloseOutlined, CreditCardOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Modal, Radio, Typography } from "antd";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

const PaymentModal = () => {
  const [isModalOpen, setIsModelOpen] = useState(false);
  const showModal = () => {
    setIsModelOpen(true);
  };
  const closeModal = () => {
    setIsModelOpen(false);
  };

  const onSubmit = () => {
    console.log("on submit");
  };

  const { control, handleSubmit } = useForm({
    defaultValues: {
      data: "yes",
    },
  });

  return (
    <>
      <Button onClick={showModal}>
        <CreditCardOutlined style={{ color: "green" }} />
      </Button>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Payment
          </Typography.Text>
        }
        open={isModalOpen}
        footer={null}
        onCancel={closeModal}
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
        <div className="mt-2 font-semibold">
          Are you sure want to realese payment
        </div>
        <Form.Item label="" name="data">
          <Controller
            control={control}
            name="data"
            render={({ field }) => (
              <Radio.Group {...field}>
                <Radio value={"yes"}>Yes</Radio>
                <Radio value={"no"}>No</Radio>
              </Radio.Group>
            )}
          />
        </Form.Item>

        <Flex justify="flex-end" className="gap-1">
          <Button onClick={closeModal}>Close</Button>
          <Button type="primary" onClick={handleSubmit(onSubmit)}>
            Confirm
          </Button>
        </Flex>
      </Modal>
    </>
  );
};

export default PaymentModal;
