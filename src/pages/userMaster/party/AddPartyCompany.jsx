import { CloseOutlined, ProjectOutlined } from "@ant-design/icons";
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
import { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  addPartyCompanyRequest,
  getPartyListRequest,
} from "../../../api/requests/users";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { mutationOnErrorHandler } from "../../../utils/mutationUtils";

const AddPartyCompany = ({ isScroll = false }) => {
  const queryClient = useQueryClient();
  const { companyId } = useContext(GlobalContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const adjustHeight = {};
  if (isScroll) {
    adjustHeight.height = "calc(100vh - 150px)";
    adjustHeight.overflowY = "scroll";
  }

  const { mutateAsync: addPartyCompany, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await addPartyCompanyRequest({
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["add", "party-company"],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "party",
        "list",
        { company_id: companyId },
      ]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      handleCancel();
    },
    onError: (error) => {
      mutationOnErrorHandler({ error, message });
    },
  });

  const onSubmit = (data) => {
    console.log("submit ", data);
    const payload = { ...data };
    addPartyCompany(payload);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    // resolver: addPartySchemaResolver,
  });

  // Load Partylist Dropdown ===========================================
  const { data: partyUserListRes, isLoading: isLoadingPartyList } = useQuery({
    queryKey: ["party", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getPartyListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  return (
    <>
      <Button onClick={showModal}>
        <ProjectOutlined />
      </Button>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Add Party Company
          </Typography.Text>
        }
        open={isModalOpen}
        footer={() => {}}
        onCancel={handleCancel}
        centered={true}
        classNames={{
          header: "text-center",
        }}
        width={"70%"}
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
            ...adjustHeight,
          },
        }}
      >
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Row
            gutter={18}
            style={{
              padding: "12px",
            }}
          >
            <Col span={12}>
              <Form.Item
                label="Company Name"
                name="company_name"
                validateStatus={errors.company_name ? "error" : ""}
                help={errors.company_name && errors.company_name.message}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="company_name"
                  render={({ field }) => (
                    <Input {...field} placeholder="Company Name" />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Company GST Number"
                name="company_gst_number"
                validateStatus={errors.company_gst_number ? "error" : ""}
                help={
                  errors.company_gst_number && errors.company_gst_number.message
                }
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="company_gst_number"
                  render={({ field }) => (
                    <Input {...field} placeholder="Company GST Number" />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="GST Date"
                name="gst_date"
                validateStatus={errors.gst_date ? "error" : ""}
                help={errors.gst_date && errors.gst_date.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="gst_date"
                  render={({ field }) => (
                    <DatePicker {...field} style={{ width: "100%" }} />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="GST Registered Date"
                name="gst_registered_date"
                validateStatus={errors.gst_registered_date ? "error" : ""}
                help={
                  errors.gst_registered_date &&
                  errors.gst_registered_date.message
                }
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="gst_registered_date"
                  render={({ field }) => (
                    <DatePicker {...field} style={{ width: "100%" }} />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Address"
                name="address"
                validateStatus={errors.address ? "error" : ""}
                help={errors.address && errors.address.message}
                wrapperCol={{ sm: 24 }}
                required={true}
              >
                <Controller
                  control={control}
                  name="address"
                  render={({ field }) => (
                    <Input {...field} placeholder="Address" />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="User"
                name="root_user_id"
                validateStatus={errors.root_user_id ? "error" : ""}
                help={errors.root_user_id && errors.root_user_id.message}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="root_user_id"
                  render={({ field }) => (
                    <Select
                      {...field}
                      className="width-100"
                      placeholder="Select Party"
                      style={{
                        textTransform: "capitalize",
                      }}
                      dropdownStyle={{
                        textTransform: "capitalize",
                      }}
                      loading={isLoadingPartyList}
                    >
                      {/* Party Options */}
                      {partyUserListRes?.partyList?.rows?.map((party) => (
                        <Select.Option key={party?.id} value={party?.id}>
                          <span>
                            {`${party?.first_name} ${party?.last_name} | `.toUpperCase()}
                            {/* <strong>{party?.party?.company_name}</strong> */}
                            <strong>{party?.username}</strong>
                          </span>
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Flex gap={10} justify="flex-end">
            <Button
              htmlType="button"
              onClick={() => {
                reset();
                handleCancel();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isPending}>
              Create
            </Button>
          </Flex>
        </Form>
      </Modal>
    </>
  );
};

export default AddPartyCompany;
