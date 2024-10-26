import { CloseOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Flex, Modal, Select, Typography } from "antd";
import { useState } from "react";

const ConfirmGstModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        CONFIRM GST
      </Button>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        open={isModalOpen}
        width={"70%"}
        footer={false}
        title={
          <Typography.Text className=" font-medium text-white">
            Confirm GST
          </Typography.Text>
        }
        centered={true}
        onCancel={closeModal}
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
        <table border={1} style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            <tr>
              <td>
                <b>GST Fill Month</b>
              </td>
              <td>
                <Select
                  placeholder="Select Month"
                  options={[
                    { label: "4, 2024", value: "4, 2024" },
                    { label: "5, 2024", value: "5, 2024" },
                    { label: "6, 2024", value: "6, 2024" },
                  ]}
                  style={{
                    width: "100%",
                    textTransform: "capitalize",
                  }}
                  dropdownStyle={{
                    textTransform: "capitalize",
                  }}
                />
              </td>
            </tr>
            <tr>
              <td>
                <b>Pending Bills</b>
              </td>
              <td>
                <div style={{ padding: "6px 0px" }}>
                  <Flex style={{ padding: "0px 6px" }} justify="space-between">
                    <span>Sale Bills</span>
                    <span>7</span>
                  </Flex>
                  <hr className="border-x-gray-100" />
                  <Flex style={{ padding: "0px 6px" }} justify="space-between">
                    <span>Beam Sale Bills</span>
                    <span>7</span>
                  </Flex>
                  <hr className="border-x-gray-100" />
                  <Flex style={{ padding: "0px 6px" }} justify="space-between">
                    <span>Yarn Sale Bills</span>
                    <span>7</span>
                  </Flex>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <b>View Bills</b>
              </td>
              <td>
                <Button type="default">
                  <EyeOutlined size={"30"} color="blue" />
                </Button>
              </td>
            </tr>
          </tbody>
        </table>

        <br />
        <Flex justify="flex-end" className="gap-1">
          <Button type="primary">Confirm</Button>
          <Button onClick={closeModal}>Cancel</Button>
        </Flex>
      </Modal>
    </>
  );
};

export default ConfirmGstModal;
