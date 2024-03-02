import { CloseOutlined } from "@ant-design/icons";
import { Modal, Button, Flex } from "antd";

const DeleteConfirmationDialog = ({
  open,
  onCancel,
  onConfirm,
  title = "Delete Confirmation",
  content = "Are you sure you want to delete this item?",
  confirmText = "Delete",
  cancelText = "Cancel",
}) => {
  return (
    <Modal
      open={open}
      title={title}
      onCancel={onCancel}
      closeIcon={<CloseOutlined className="text-white" />}
      footer={
        <Flex className="px-4 py-3" justify="end">
          <Button key="cancel" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button key="confirm" type="primary" onClick={onConfirm}>
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

export default DeleteConfirmationDialog;
