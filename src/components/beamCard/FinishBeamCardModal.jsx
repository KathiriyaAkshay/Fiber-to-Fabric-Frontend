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
import { useEffect, useState } from "react";
import {
  finishRunningBeamRequest,
  moveCutToNonPasarelaRequest,
  reloadBeamRequest,
} from "../../api/requests/beamCard";
import { capitalizeFirstCharacter } from "../../utils/mutationUtils";

const FinishBeamCardModal = ({ details = {}, companyId, beamTypeDropDown }) => {
  console.log(details);
  
  const queryClient = useQueryClient();
  const [beamNumber, setBeamNumber] = useState(null) ; 

  useEffect(() => {
    if (details?.non_pasarela_beam_detail != null){
      setBeamNumber(details?.non_pasarela_beam_detail?.beam_no) ; 
    } else if (details?.recieve_size_beam_detail !== null){
      setBeamNumber(details?.recieve_size_beam_detail?.beam_no) ; 
    } else {
      setBeamNumber(details?.job_beam_receive_detail?.beam_no)
    }
  }, [details])

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [finishValue, setFinishValue] = useState("bhidan(finish)");

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
          message.success("Beam successfully move to Non Pasarela");
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
            <Row className="beam-details-information-div" style={{marginTop: 10}}>
              <Col span={6} className=" beam-card-info-title"> Beam No </Col>
              <Col span={6}>
                {beamNumber}
              </Col>
            </Row>

            <Row className="beam-details-information-div beam-details-other-div">
              <Col span={6} className="beam-card-info-title"> Machine No </Col>
              <Col span={6}>{details?.machine_no} ({capitalizeFirstCharacter(details?.machine_name)})</Col>
            </Row>

            <Divider style={{marginTop: 10}} />
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
