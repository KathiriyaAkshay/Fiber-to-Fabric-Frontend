import { useState } from "react";
import { Button, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import DeleteConfirmationDialog from "../../common/modal/DeleteConfirmationDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCompanyPartnerRequest } from "../../../api/requests/company";

const DeleteCompanyPartner = ({ partnerDetails }) => {
  const queryClient = useQueryClient();
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);

  const { mutateAsync: deleteCompanyPartner } = useMutation({
    mutationFn: async ({ partnerId, params }) => {
      const res = await deleteCompanyPartnerRequest({ partnerId, params });
      return res?.data;
    },
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      queryClient.invalidateQueries([
        "company",
        "partner",
        "get",
        { type: "PARTNER" },
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
    deleteCompanyPartner({
      partnerId: partnerDetails.id,
    });
    setIsOpenDeleteDialog(false);
  }

  return (
    <div>
      <Button
        onClick={() => {
          setIsOpenDeleteDialog(true);
        }}
      >
        <DeleteOutlined />
      </Button>

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

export default DeleteCompanyPartner;
