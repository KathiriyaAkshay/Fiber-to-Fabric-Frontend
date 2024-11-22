import { CloseOutlined, FileSyncOutlined } from "@ant-design/icons";
import { Button, Flex, Modal, Typography } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";

const DebitorNotesModal = () => {
  const [isModalOpen, setIsModelOpen] = useState(false);
  const showModal = () => {
    setIsModelOpen(true);
  };
  const closeModal = () => {
    setIsModelOpen(false);
  };

  return (
    <>
      <Button onClick={showModal}>
        <FileSyncOutlined />
      </Button>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            ❖ BABAJI SILK FABRIC / H M SILK FABRIC ❖
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
            width: "800px",
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
        <div className="font-semibold text-lg mb-3"> ◈ Write Notes:</div>

        <table>
          <tbody>
            <tr>
              <td>
                <b>20/11/2022 :</b>
              </td>
              <td>Notes description</td>
            </tr>
            <tr>
              <td>
                <b>20/11/2022 :</b>
              </td>
              <td>Notes description</td>
            </tr>
            <tr>
              <td>
                <b>20/11/2022 :</b>
              </td>
              <td>Notes description</td>
            </tr>
            <tr>
              <td
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Flex align="center">
                  <span>✍</span>
                  <b>20/11/2022</b>
                </Flex>
              </td>
              <td>
                <TextArea rows={4} cols={95} />
              </td>
            </tr>
          </tbody>
        </table>

        <Flex justify="flex-end" className="gap-1">
          <Button onClick={closeModal}>Close</Button>
          <Button type="primary">Save</Button>
        </Flex>
      </Modal>
    </>
  );
};

export default DebitorNotesModal;
