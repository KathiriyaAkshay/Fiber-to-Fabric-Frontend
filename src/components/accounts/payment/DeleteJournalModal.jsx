import { useContext, useState } from "react";
import { Button, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DeleteConfirmationDialog from "../../common/modal/DeleteConfirmationDialog";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { deleteJournalRequest } from "../../../api/requests/accounts/payment";

const DeleteJournalModal = ({ details }) => {
  const queryClient = useQueryClient();
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);

  const { companyId } = useContext(GlobalContext);

  const { mutateAsync: deleteJournal } = useMutation({
    mutationFn: async ({ id }) => {
      const res = await deleteJournalRequest({
        id,
        params: {
          company_id: companyId,
        },
      });
      return res?.data;
    },
    mutationKey: ["payment", "journal", "delete"],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      queryClient.invalidateQueries([
        "get",
        "payment",
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
    deleteJournal({
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
        title="Delete Confirmation"
        content="Are you sure you want to delete?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default DeleteJournalModal;
