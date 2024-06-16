import { useContext, useState } from "react";
import { Button, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { deleteSizeBeamOrderRequest } from "../../../api/requests/orderMaster";
import DeleteConfirmationDialog from "../../common/modal/DeleteConfirmationDialog";

const DeleteSizeBeamOrderButton = ({ data }) => {
  const { companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);

  const { mutateAsync: deleteSizeBeamOrder } = useMutation({
    mutationFn: async ({ id }) => {
      const res = await deleteSizeBeamOrderRequest({
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
        "order-master",
        "size-beam-order",
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
    deleteSizeBeamOrder({
      id: data.id,
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
        content="Are you sure you want to delete size beam order?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default DeleteSizeBeamOrderButton;
