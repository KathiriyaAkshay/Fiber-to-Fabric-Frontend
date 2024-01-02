import { Modal, Button } from "antd";

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
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {cancelText}
        </Button>,
        <Button key="confirm" type="primary" onClick={onConfirm}>
          {confirmText}
        </Button>,
      ]}
    >
      <p>{content}</p>
    </Modal>
  );
};

export default DeleteConfirmationDialog;
