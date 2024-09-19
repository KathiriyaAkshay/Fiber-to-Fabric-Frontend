import { TruckOutlined } from "@ant-design/icons";
import { Modal, Radio } from "antd";
import React, { useState } from "react";
import { Button, Checkbox, Form, Input } from "antd";

const onFinish = (values) => {
  console.log("Success:", values);
};
const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

const Invoice = () => {
  const [isModalOpen, setIsAddModalOpen] = useState(false);
  const showModal = () => {
    setIsAddModalOpen(true);
  };
  const handleOk = () => {
    setIsAddModalOpen(false);
  };
  const handleCancel = () => {
    setIsAddModalOpen(false);
  };
  return (
    <>
      <Button onClick={() => showModal()}>
        <TruckOutlined />
      </Button>
      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={"40%"}
      >
        <Form
          name="basic"
          layout="vertical"
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 24,
          }}
        //   style={{
        //     maxWidth: 600,
        //   }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <div className="mt-2 font-semibold">E-way bill & E-Invoice</div>
          <Radio.Group
            // {...field}
            className="mt-2"
            name="production_filter"
            onChange={(e) => {
              // field.onChange(e);
              // changeProductionFilter(e.target.value);
            }}
          >
            <Radio value={"e_way"}>E-Way Bill</Radio>
            <Radio value={"e_invoice"}>E-Invoice Bill</Radio>
          </Radio.Group>
          <div className="mt-2 font-semibold">
            Generate & View/Download/Cancel E-Invoice Bill
          </div>
          <div className="mt-2 font-semibold">
            Click Submit for Generate E-Invoice number.
          </div>
          <Form.Item
            label="Username"
            name="username"
            className="mt-2"
            rules={[
              {
                required: true,
                message: "Please input your username!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Invoice;
