import { useContext, useEffect, useState } from "react";
import { Col, Flex, Modal, Row, Typography } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useCurrentUser } from "../../../api/hooks/auth";
import { GlobalContext } from "../../../contexts/GlobalContext";

const ProfileDetailModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [details, setDetails] = useState([]);
  const { data: user } = useCurrentUser();

  const { company } = useContext(GlobalContext);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!user || !company) return;
    const {
      address,
      adhar_no,
      email,
      first_name,
      gst_no,
      last_name,
      mobile,
      pancard_no,
      username,
    } = user;
    const { company_name, address_line_1, address_line_2, company_contact } =
      company;
    setDetails([
      { title: "Name", value: `${first_name || ""} ${last_name || ""}` },
      { title: "Address", value: address },
      { title: "Company Name", value: company_name },
      {
        title: "Company Address",
        value: `${address_line_1 || ""} ${address_line_2 || ""}`,
      },
      { title: "Company Contact", value: company_contact },
      { title: "Mobile", value: mobile },
      { title: "Pan No.", value: pancard_no },
      { title: "GST No.", value: gst_no },
      { title: "Adhar No", value: adhar_no },
      { title: "Email", value: email },
      { title: "User Name", value: username },
      // { title: "Current Plan", value: "--" },
      // { title: "Plan Price", value: "--" },
      // { title: "Plan Start Date", value: "--" },
      // { title: "Plan End Date", value: "--" },
    ]);
  }, [company, user]);

  return (
    <>
      <Typography.Text onClick={showModal} className="block">
        My Profile
      </Typography.Text>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            My Profile
          </Typography.Text>
        }
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
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
          {details?.map(({ title = "", value = "" }) => {
            return (
              <Row gutter={12} className="flex-grow" key={title}>
                <Col span={10} className="font-medium">
                  {title}
                </Col>
                <Col span={14}>{value || "-"}</Col>
              </Row>
            );
          })}
        </Flex>
      </Modal>
    </>
  );
};
export default ProfileDetailModal;
