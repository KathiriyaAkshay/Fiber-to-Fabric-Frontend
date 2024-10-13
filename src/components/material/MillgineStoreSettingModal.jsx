import { CloseOutlined, SettingOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Row,
  Typography,
} from "antd";
import { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { GlobalContext } from "../../contexts/GlobalContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { createMillgineStoreRequest } from "../../api/requests/material";

const MillgineStoreSettingModal = ({ details }) => {
  const { companyId } = useContext(GlobalContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const { mutateAsync: createMillgineStore, isPending } = useMutation({
    mutationKey: ["create", "millgine-store"],
    mutationFn: async (data) => {
      const res = await createMillgineStoreRequest({
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
      queryClient.invalidateQueries({
        queryKey: ["get", "millgine-report", "list"],
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
      for_machine: data.selection === "for_machine" ? true : false,
      code: details.code,
      quantity: +data.quantity,
      pcs: +data.pcs,
      amount: +data.quantity * +data.pcs,
      remark: data.remark,
    };
    await createMillgineStore(payload);
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    resetField,
  } = useForm({
    defaultValues: {
      selection: "for_machine",
      machine_no: "",
      date: dayjs(),
      quantity: "",
      pcs: "",
      remark: "",
    },
  });

  const { selection } = watch();

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        <SettingOutlined />
      </Button>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Millgine Use into
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
              // label={"Voucher Date"}
              name="selection"
              // validateStatus={errors.selection ? "error" : ""}
              // help={errors.selection && errors.voucher_date.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="selection"
                render={({ field }) => {
                  return (
                    <Radio.Group
                      {...field}
                      onChange={(e) => {
                        if (e.target.value) {
                          resetField("machine_no", "");
                        }
                        field.onChange(e);
                      }}
                      className="payment-options"
                    >
                      <Radio value={"for_machine"}>{"For Machine"}</Radio>
                      <Radio value={"for_other"}>{"For Other"}</Radio>
                    </Radio.Group>
                  );
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={"Machine No."}
              name="machine_no"
              validateStatus={errors.machine_no ? "error" : ""}
              help={errors.machine_no && errors.machine_no.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="machine_no"
                render={({ field }) => {
                  return (
                    <Input
                      {...field}
                      style={{ width: "100%" }}
                      type="number"
                      readOnly={selection === "for_other"}
                    />
                  );
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

          <Col span={12}>
            <Form.Item
              label={"Quantity"}
              name="quantity"
              validateStatus={errors.quantity ? "error" : ""}
              help={errors.quantity && errors.quantity.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="quantity"
                render={({ field }) => {
                  return <Input {...field} />;
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={"Pcs"}
              name="pcs"
              validateStatus={errors.pcs ? "error" : ""}
              help={errors.pcs && errors.pcs.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="pcs"
                render={({ field }) => {
                  return <Input {...field} />;
                }}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label={"Remark"}
              name="remark"
              validateStatus={errors.remark ? "error" : ""}
              help={errors.remark && errors.remark.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="remark"
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
            Submit
          </Button>
        </Flex>
      </Modal>
    </>
  );
};

export default MillgineStoreSettingModal;
