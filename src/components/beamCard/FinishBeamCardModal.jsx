import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  Divider,
  Flex,
  message,
  Modal,
  Radio,
  Row,
  Typography,
} from "antd";
import { useState } from "react";
import {
  finishRunningBeamRequest,
  moveCutToNonPasarelaRequest,
  reloadBeamRequest,
} from "../../api/requests/beamCard";

const FinishBeamCardModal = ({ details = {}, companyId, beamTypeDropDown }) => {
  console.log("FinishBeamCardModal", beamTypeDropDown);
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [finishValue, setFinishValue] = useState("bhidan(finish)");
  console.log({ finishValue });

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const { mutateAsync: finishBeamHandler, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await finishRunningBeamRequest({
        data,
        params: {
          company_id: companyId,
          is_cut: finishValue === "cut" ? 1 : 0,
        },
      });
      return res.data;
    },
    mutationKey: ["finish", "running", "beam"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["beamCard", "list", companyId]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      handleCancel();
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const { mutateAsync: moveToNonPasarelaHandler, isPending: isPendingMove } =
    useMutation({
      mutationFn: async (data) => {
        const res = await moveCutToNonPasarelaRequest({
          data,
          params: {
            company_id: companyId,
          },
        });
        return res.data;
      },
      mutationKey: ["move", "non-pasarela", "beam"],
      onSuccess: (res) => {
        queryClient.invalidateQueries(["beamCard", "list", companyId]);
        const successMessage = res?.message;
        if (successMessage) {
          message.success(successMessage);
        }
        handleCancel();
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || error.message;
        message.error(errorMessage);
      },
    });

  const { mutateAsync: reloadBeamHandler, isPending: isPendingReloadBeam } =
    useMutation({
      mutationFn: async (data) => {
        const res = await reloadBeamRequest({
          data,
          params: {
            company_id: companyId,
          },
        });
        return res.data;
      },
      mutationKey: ["reload", "beam"],
      onSuccess: (res) => {
        queryClient.invalidateQueries(["beamCard", "list", companyId]);
        const successMessage = res?.message;
        if (successMessage) {
          message.success(successMessage);
        }
        handleCancel();
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || error.message;
        message.error(errorMessage);
      },
    });

  return (
    <>
      <Button onClick={showModal}>
        <PlusOutlined />
      </Button>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            {beamTypeDropDown === "cut" || beamTypeDropDown === "pasarela"
              ? "Move to Non-Pasarela"
              : beamTypeDropDown === "primary(advance)"
              ? "Move to Running"
              : "Are you sure you want to Finish this beam?"}
          </Typography.Text>
        }
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        centered={true}
        className="view-in-house-quality-model"
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
      >
        {beamTypeDropDown === "cut" || beamTypeDropDown === "pasarela" ? (
          "Are you sure to Move this beam to non-pasarela?"
        ) : beamTypeDropDown === "primary(advance)" ? (
          "Are you sure to Move this beam to Running?"
        ) : (
          <>
            <Row>
              <Col span={6}> Beam No </Col>
              <Col span={6}>BN 347</Col>
            </Row>

            <Row>
              <Col span={6}> Machine No </Col>
              <Col span={6}>1</Col>
            </Row>

            <Divider />
            <Radio.Group
              name="finish"
              value={finishValue}
              onChange={(e) => setFinishValue(e.target.value)}
            >
              <Radio value={"bhidan(finish)"}>Bhidan (Finish)</Radio>
              <Radio value={"cut"}>Cut</Radio>
            </Radio.Group>
          </>
        )}

        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          {beamTypeDropDown === "cut" ||
          beamTypeDropDown === "pasarela" ||
          beamTypeDropDown === "primary(advance)" ? (
            <Button
              type="primary"
              htmlType="submit"
              loading={isPendingMove || isPendingReloadBeam}
              onClick={() => {
                if (beamTypeDropDown === "primary(advance)") {
                  reloadBeamHandler({
                    beam_load_id: details.id,
                  });
                } else {
                  moveToNonPasarelaHandler({
                    beam_load_id: details.id,
                  });
                }
              }}
            >
              Move
            </Button>
          ) : (
            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              onClick={() => {
                finishBeamHandler({
                  loaded_beam_id: details.id,
                });
              }}
            >
              Confirm
            </Button>
          )}
        </Flex>
      </Modal>
    </>
  );
};

export default FinishBeamCardModal;
