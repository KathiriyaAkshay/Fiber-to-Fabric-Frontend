import { useContext, useState } from "react";
import { Button, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DeleteConfirmationDialog from "../../../common/modal/DeleteConfirmationDialog";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { deleteRevertPassbookRequest } from "../../../../api/requests/accounts/payment";

const DeletePassBookEntry = ({ details }) => {
  const queryClient = useQueryClient();
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);

  const { companyId } = useContext(GlobalContext);

  const { mutateAsync: deletePassBookEntry } = useMutation({
    mutationFn: async ({ id }) => {
      const res = await deleteRevertPassbookRequest({
        id,
        params: {
          company_id: companyId,
          is_delete: 1,
        },
      });
      return res?.data;
    },
    mutationKey: ["passbook", "delete"],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      queryClient.invalidateQueries([
        "get",
        "passBook",
        "list",
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
    deletePassBookEntry({
      id: details.id,
    });
    setIsOpenDeleteDialog(false);
  }

  return (
    <div>
      {/* Trigger to open the delete confirmation dialog */}
      <Button
        danger
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
        title="Alert"
        content="Are you sure to Delete this entry?"
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
};

export default DeletePassBookEntry;
