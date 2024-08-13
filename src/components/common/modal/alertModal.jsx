// import { CloseOutlined } from "@ant-design/icons";
import { Modal, Button, Flex } from "antd";

const AlertModal = ({
  open,
  onCancel,
  onConfirm,
  title = "Alert",
  content = "Are you sure you want to change?",
  confirmText = "Yes",
  cancelText = "Cancel",
}) => {
  return (
    <Modal
      open={open}
      title={title}
      // onCancel={onCancel}
      closeIcon={null}
      footer={
        <Flex className="px-4 py-3" justify="end" gap={10}>
          <Button key="cancel" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button key="confirm" type="primary" onClick={onConfirm} danger>
            {confirmText}
          </Button>
        </Flex>
      }
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
          padding: "0px 16px",
        },
      }}
    >
      <p>{content}</p>
    </Modal>
  );
};

export default AlertModal;
