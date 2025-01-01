import { useContext, useEffect, useState } from "react";
import { Button, message, Modal } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DeleteConfirmationDialog from "../../common/modal/DeleteConfirmationDialog";
import { deleteYSCompanyRequest } from "../../../api/requests/yarnStock";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { useQuery } from "@tanstack/react-query";
import { yarnStockWarningRequest } from "../../../api/requests/yarnStock";

const DeleteYarnStockCompany = ({ details }) => {
  const queryClient = useQueryClient();
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [yarnWarningModel, setYarnWarningModel] = useState(false);

  const { companyId } = useContext(GlobalContext);

  const { mutateAsync: deleteYarnStockCompany } = useMutation({
    mutationFn: async ({ id }) => {
      const res = await deleteYSCompanyRequest({
        id,
        params: {
          company_id: companyId,
        },
      });
      return res?.data;
    },
    mutationKey: ["yarn-stock", "company", "delete"],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      queryClient.invalidateQueries([
        "yarn-stock",
        "company",
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
    deleteYarnStockCompany({
      id: details.id,
    });
    setIsOpenDeleteDialog(false);
  }

  // Fetch yarn company related warning details =========================
  const [yarnWarningDetails, setYarnWarningDetails] = useState(undefined);
  const [yarnWarningLoading, setYarnWarningLoading] = useState(false);
  const fetchYarnWarningDetails = async () => {
    if (!companyId || !details?.id) {
      console.error("Company ID and Yarn Company ID are required.");
      return;
    }
    try {
      setYarnWarningLoading(true);
      const response = await yarnStockWarningRequest({
        params: {
          company_id: companyId,
          yarn_company_id: details?.id,
        },
      });

      setYarnWarningDetails(response?.data?.data);
    } catch (err) {
    } finally {
      setYarnWarningLoading(false);
    }
  };

  useEffect(() => {
    if (yarnWarningDetails !== undefined) {
      let allStockcount = [];
      allStockcount.push(yarnWarningDetails?.total_challan);
      allStockcount.push(yarnWarningDetails?.total_order);
      allStockcount.push(yarnWarningDetails?.sale_total);
      allStockcount.push(yarnWarningDetails?.quality_involved);
      allStockcount.push(yarnWarningDetails?.yarnSentCount);
      allStockcount.push(yarnWarningDetails?.yarn_stock_report || 0);
      allStockcount.push(yarnWarningDetails?.send_beam_pipe_order || 0)

      allStockcount = [...new Set(allStockcount)]

      if (allStockcount?.length == 1 && allStockcount[0] == 0) {
        setIsOpenDeleteDialog(true);
      } else {
        setYarnWarningModel(true);
      }
    }
  }, [yarnWarningDetails])

  useEffect(() => {
    if (isOpenDeleteDialog) {
      fetchYarnWarningDetails();
    }
  }, [isOpenDeleteDialog])


  return (
    <div>
      {/* Trigger to open the delete confirmation dialog */}
      <Button
        danger
        loading={yarnWarningLoading}
        onClick={async () => {
          await fetchYarnWarningDetails();
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
        content="Are you sure you want to delete yarn stock company?"
        confirmText="Delete"
        cancelText="Cancel"
      />

      <Modal
        open={yarnWarningModel}
        title="Yarn Info"
        onCancel={() => { setYarnWarningModel(false) }}
        className="view-in-house-quality-model"
        centered
        classNames={{
          header: "text-center",
        }}
        styles={{
          content: {
            padding: 0,
            width: "600px",
            margin: "auto",
          },
          header: {
            padding: "16px",
            margin: 0,
          },
          body: {
            padding: "10px 16px",
          },
        }}
        footer={null}
      >
        <div class="ui-box">
          <p class="heading">
            ▼ If you want to remove these details, remove the entries from the following places.
          </p>
          <ul class="details-list" >

            {/* Yarn challan information  */}
            {yarnWarningDetails?.total_challan > 0 && (
              <li>Total Yarn Receive Challan: <span>{yarnWarningDetails?.total_challan || 0}</span></li>
            )}

            {/* Yarn order information  */}
            {yarnWarningDetails?.total_order > 0 && (
              <li>Total Yarn Order: <span>{yarnWarningDetails?.total_order || 0}</span></li>
            )}

            {/* Total sale order information  */}
            {yarnWarningDetails?.sale_total > 0 && (
              <li>Total Yarn sale challan: <span>{yarnWarningDetails?.sale_total}</span></li>
            )}

            {/* Quality involved related information  */}
            {yarnWarningDetails?.quality_involved > 0 && (
              <li>Quality Involved: <span>{yarnWarningDetails?.quality_involved}</span></li>
            )}

            {/* Yarn sent count information  */}
            {yarnWarningDetails?.yarnSentCount > 0 && (
              <li>Total Yarn Sent: <span>{yarnWarningDetails?.yarnSentCount}</span></li>
            )}

            {/* Yarn stock report count information  */}
            {yarnWarningDetails?.yarn_stock_report > 0 && (
              <li>Total Yarn Stock Report: <span>{yarnWarningDetails?.yarn_stock_report}</span></li>
            )}

            {/* Total Send beam pipe order information */}
            {yarnWarningDetails?.send_beam_pipe_order > 0 && (
              <li>Total Send Beam Pipe Order: <span>{yarnWarningDetails?.send_beam_pipe_order}</span></li>
            )}
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default DeleteYarnStockCompany;
