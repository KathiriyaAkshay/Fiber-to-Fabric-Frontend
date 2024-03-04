import { useContext, useState } from "react";
import { Button, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import DeleteConfirmationDialog from "../common/modal/DeleteConfirmationDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTaskRequest } from "../../api/requests/task";
import { GlobalContext } from "../../contexts/GlobalContext";

const DeleteTaskButton = ({ details }) => {
  const { companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);

  const { mutateAsync: deleteTask } = useMutation({
    mutationFn: async ({ id }) => {
      const res = await deleteTaskRequest({
        id,
        params: {
          company_id: companyId,
        },
      });
      return res?.data;
    },
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      queryClient.invalidateQueries(["task-assignment", "list", companyId]);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  async function handleDelete() {
    deleteTask({
      id: details.id,
    });
    setIsOpenDeleteDialog(false);
  }

  return (
    <div>
      {/* Trigger to open the delete confirmation dialog */}
      <Button
        onClick={() => {
          setIsOpenDeleteDialog(true);
        }}
      >
        <DeleteOutlined />
      </Button>

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        open={isOpenDeleteDialog}
        onCancel={() => setIsOpenDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Confirmation"
        content="Are you sure you want to delete this item?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default DeleteTaskButton;
