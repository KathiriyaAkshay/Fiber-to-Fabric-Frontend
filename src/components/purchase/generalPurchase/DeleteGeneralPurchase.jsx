import { useContext, useState } from "react";
import { Button, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { deleteGeneralPurchaseRequest } from "../../../api/requests/purchase/purchaseSizeBeam";
import DeleteConfirmationDialog from "../../common/modal/DeleteConfirmationDialog";

const DeleteGeneralPurchaseButton = ({ details }) => {
    const { companyId } = useContext(GlobalContext);
    const queryClient = useQueryClient();
    const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);

    const { mutateAsync: deleteGeneralPurchase } = useMutation({
        mutationFn: async ({ id }) => {
          const res = await deleteGeneralPurchaseRequest({
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
            "purchase/generalPurchase/list",
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

    async function handleDelete(){
        deleteGeneralPurchase({
            id: details?.id
        })
        setIsOpenDeleteDialog(false) ; 
    }

    return (
        <>
            <div>
                <Button
                    danger
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
                    content="Are you sure you want to delete this general purchase?"
                    confirmText="Delete"
                    cancelText="Cancel"
                />
            </div>
        </>
    )
}

export default DeleteGeneralPurchaseButton; 