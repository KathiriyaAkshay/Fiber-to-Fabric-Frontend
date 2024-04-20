import { useState } from "react";
import { Button, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import DeleteConfirmationDialog from "../common/modal/DeleteConfirmationDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCompanyBankRequest } from "../../api/requests/company";

const DeleteCompanyBank = ({ companyBankDetails = {}, company = {} }) => {
  const { id: companyBankId } = companyBankDetails;
  const { id: companyId } = company;

  const queryClient = useQueryClient();
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);

  // Mutation for delete company bank
  const { mutateAsync: deleteCompany } = useMutation({
    mutationFn: async ({ id }) => {
      const res = await deleteCompanyBankRequest({
        id,
        params: { company_id: companyId },
      });
      return res?.data;
    },
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      queryClient.invalidateQueries(["company", "list"]);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  async function handleDelete() {
    deleteCompany({
      id: companyBankId,
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

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        open={isOpenDeleteDialog}
        onCancel={() => setIsOpenDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Confirmation"
        content="Are you sure you want to delete account details?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default DeleteCompanyBank;
