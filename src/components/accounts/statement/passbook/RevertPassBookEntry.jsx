import { useContext, useState } from "react";
import { Button, message } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DeleteConfirmationDialog from "../../../common/modal/DeleteConfirmationDialog";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { deleteRevertPassbookRequest } from "../../../../api/requests/accounts/payment";

const RevertPassBookEntry = ({ details }) => {
  const queryClient = useQueryClient();
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);

  const { companyId } = useContext(GlobalContext);

  const { mutateAsync: deletePassBookEntry } = useMutation({
    mutationKey: ["passbook", "delete"],
    mutationFn: async ({ id }) => {
      const res = await deleteRevertPassbookRequest({
        id,
        params: {
          company_id: companyId,
          is_delete: 0,
        },
      });
      return res?.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "get",
        "passBook",
        "list",
        { company_id: companyId },
      ]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
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
        <CloseOutlined />
      </Button>

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        open={isOpenDeleteDialog}
        onCancel={() => setIsOpenDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Alert"
        content="Are you sure to Revert this entry?"
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
};

export default RevertPassBookEntry;
