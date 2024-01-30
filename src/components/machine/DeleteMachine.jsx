import { useState } from "react";
import { Button, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import DeleteConfirmationDialog from "../common/modal/DeleteConfirmationDialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteMachineRequest } from "../../api/requests/machine";
import { getCompanyListRequest } from "../../api/requests/company";

const DeleteMachine = ({ details }) => {
  const queryClient = useQueryClient();
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);

  const { data: companyListRes } = useQuery({
    queryKey: ["company", "list"],
    queryFn: async () => {
      const res = await getCompanyListRequest({});
      return res.data?.data;
    },
  });

  const companyId = companyListRes?.rows?.[0]?.id;

  const { mutateAsync: deleteMachine } = useMutation({
    mutationFn: async ({ id, config }) => {
      const res = await deleteMachineRequest({ id, config });
      return res?.data;
    },
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      queryClient.invalidateQueries(["machine", "list", companyId]);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  async function handleDelete() {
    deleteMachine({
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

export default DeleteMachine;
