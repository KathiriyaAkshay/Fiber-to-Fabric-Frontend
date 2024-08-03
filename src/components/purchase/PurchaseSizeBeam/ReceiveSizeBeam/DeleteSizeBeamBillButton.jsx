import { DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import DeleteConfirmationDialog from "../../../common/modal/DeleteConfirmationDialog";
import { useContext } from "react";
import { useState } from "react";
import { Button, message } from "antd";
import { deleteReceiveSizeBeamBillRequest } from "../../../../api/requests/purchase/purchaseSizeBeam";

const DeleteSizeBeamBillButton = ({details}) => {
    const {companyId} = useContext(GlobalContext) ; 
    const queryClient = useQueryClient() ; 
    const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);

    const { mutateAsync: deleteSizeBeamBill } = useMutation({
        mutationFn: async ({ id }) => {
          const res = await deleteReceiveSizeBeamBillRequest({
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
            message.success("Size beam bill deleted successfully");
          }
          queryClient.invalidateQueries([
            "recive-size-beam/bill/list",
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

    const handleDelete = async () => {
        await deleteSizeBeamBill({
            id: details?.id
        }); 
        setIsOpenDeleteDialog(false) ; 
    }
    return(
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
                onCancel={() => {setIsOpenDeleteDialog(false)}}
                onConfirm={handleDelete}
                title="Delete Confirmation"
                content="Are you sure you want to delete this Size beam Receive Bill?"
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    )
}

export default DeleteSizeBeamBillButton ; 