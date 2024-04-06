import { useContext, useState } from "react";
import { Button, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DeleteConfirmationDialog from "../../common/modal/DeleteConfirmationDialog";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { deleteWastageReportTaskRequest } from "../../../api/requests/reports/wastageReportTask";

const DeleteWastageReportTaskButton = ({ details }) => {
  const { companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);

  const { mutateAsync: deleteReport } = useMutation({
    mutationFn: async ({ id }) => {
      const res = await deleteWastageReportTaskRequest({
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
      queryClient.invalidateQueries([
        "reports/wastage-report-task/list",
        { company_id: companyId },
      ]);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  async function handleDelete() {
    deleteReport({
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

export default DeleteWastageReportTaskButton;
