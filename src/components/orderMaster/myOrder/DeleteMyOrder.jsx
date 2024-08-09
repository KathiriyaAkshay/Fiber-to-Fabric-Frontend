import { useContext, useState } from "react";
import { Button, Flex, message, Modal, Radio } from "antd";
import { CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// import DeleteConfirmationDialog from "../../common/modal/DeleteConfirmationDialog";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { deleteMyOrderRequest } from "../../../api/requests/orderMaster";

const DeleteMyOrder = ({ details }) => {
  const queryClient = useQueryClient();
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [selectedValue, setSelectedValue] = useState(0);

  const { companyId } = useContext(GlobalContext);

  const { mutateAsync: deleteMyOrder, isPending } = useMutation({
    mutationFn: async ({ id, is_finished }) => {
      const res = await deleteMyOrderRequest({
        id,
        params: {
          company_id: companyId,
          is_finished: is_finished,
        },
      });
      return res?.data;
    },
    mutationKey: ["myOrder", "delete"],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      queryClient.invalidateQueries(["myOrder", "list", companyId]);
      setIsOpenDeleteDialog(false);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  async function handleDelete() {
    deleteMyOrder({
      id: details.id,
      is_finished: selectedValue,
    });
  }

  return (
    <div>
      {/* Trigger to open the delete confirmation dialog */}
      <Button
        onClick={() => {
          setIsOpenDeleteDialog(true);
        }}
        danger={true}
        loading={isPending}
      >
        <DeleteOutlined />
      </Button>

      <Modal
        open={isOpenDeleteDialog}
        title={"Delete Confirmation"}
        onCancel={() => setIsOpenDeleteDialog(false)}
        closeIcon={<CloseOutlined className="text-white" />}
        footer={
          <Flex className="px-4 py-3" justify="end" gap={10}>
            <Button key="cancel" onClick={() => setIsOpenDeleteDialog(false)}>
              Cancel
            </Button>
            <Button key="confirm" type="primary" onClick={handleDelete} danger>
              Confirm
            </Button>
          </Flex>
        }
        centered={true}
        classNames={{
          header: "text-center",
        }}
        styles={{
          content: {
            padding: 0,
          },
          header: {
            padding: "16px",
            margin: 0,
          },
          body: {
            padding: "0px 16px",
          },
        }}
      >
        {/* <p>Are you sure you want to delete order?</p> */}
        <Radio.Group
          name="selection"
          value={selectedValue}
          onChange={(e) => setSelectedValue(e.target.value)}
          style={{ marginTop: "1rem" }}
        >
          {details.delivered_meter === 0 ? (
            <Radio value={0}>Remove</Radio>
          ) : (
            <>
              <Radio value={0}>Cancel</Radio>
              <Radio value={1}>Finish</Radio>
            </>
          )}
        </Radio.Group>
      </Modal>
    </div>
  );
};

export default DeleteMyOrder;
