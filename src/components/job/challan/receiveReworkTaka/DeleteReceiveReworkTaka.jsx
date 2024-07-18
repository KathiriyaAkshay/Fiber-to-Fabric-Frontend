import { useContext, useState } from "react";
import { Button, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DeleteConfirmationDialog from "../../../common/modal/DeleteConfirmationDialog";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { deleteReceiveReworkTakaRequest } from "../../../../api/requests/job/challan/receiveReworkTaka";

const DeleteReceiveReworkTaka = ({ details }) => {
  const queryClient = useQueryClient();
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);

  const { companyId } = useContext(GlobalContext);

  const { mutateAsync: deleteYarnSent } = useMutation({
    mutationFn: async ({ id }) => {
      const res = await deleteReceiveReworkTakaRequest({
        id,
        params: {
          company_id: companyId,
        },
      });
      return res?.data;
    },
    mutationKey: ["receiveReworkTaka", "delete"],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      queryClient.invalidateQueries([
        "receive",
        "rework",
        "taka",
        "list",
        companyId,
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
    deleteYarnSent({
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
        content="Are you sure you want to delete rework taka?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default DeleteReceiveReworkTaka;
