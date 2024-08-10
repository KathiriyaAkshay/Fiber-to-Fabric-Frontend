import { CloseOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  Flex,
  Form,
  message,
  Modal,
  Row,
  Select,
  Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import {
  getLoadedMachineListRequest,
  reloadBeamRequest,
} from "../../api/requests/beamCard";
import { getCompanyMachineListRequest } from "../../api/requests/machine";

const MoveBhidanModal = ({ open, handleClose, row, companyId }) => {
  const queryClient = useQueryClient();

  const [machineName, setMachineName] = useState(null);
  const [machineNo, setMachineNo] = useState(null);

  const handleCancel = () => {
    setMachineName(null);
    setMachineNo(null);
    handleClose();
  };

  // Machine name dropdown list request
  const { data: machineListRes, isLoading: isLoadingMachineList } = useQuery({
    queryKey: ["machine", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getCompanyMachineListRequest({
        companyId,
        params: { company_id: companyId },
      });
      return res.data?.data?.machineList;
    },
    enabled: Boolean(companyId),
  });

  // Machine number dropdownlist request
  const { data: loadedMachineList } = useQuery({
    queryKey: [
      "loaded",
      "machine",
      "list",
      { company_id: companyId, machine_name: machineName },
    ],
    queryFn: async () => {
      if (machineName) {
        const res = await getLoadedMachineListRequest({
          params: { company_id: companyId, machine_name: machineName },
        });
        return res.data?.data;
      }
    },
    enabled: Boolean(companyId),
    initialData: { rows: [], machineDetail: {} },
  });

  const machineNoOption = useMemo(() => {
    if (loadedMachineList.machineDetail) {
      let array = [];
      for (
        let i = 1;
        i <= loadedMachineList.machineDetail.no_of_machines;
        i++
      ) {
        const isExist = loadedMachineList.rows.find(
          ({ machine_no }) => i === +machine_no
        );
        if (!isExist) {
          array.push(i);
        }
      }
      return array;
    }
  }, [loadedMachineList]);

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

  const onSubmit = async () => {
    const payload = {
      beam_load_id: row.id,
      machine_no: machineNo,
    };
    await reloadBeamHandler(payload);
  };

  useEffect(() => {
    if (row) {
      setTimeout(() => {
        setMachineName(row.machine_name);
      }, 200);
    }
  }, [row]);

  return (
    <Modal
      closeIcon={<CloseOutlined className="text-white" />}
      title={
        <Typography.Text className="text-xl font-medium text-white">
          Move to Bhidan
        </Typography.Text>
      }
      open={open}
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
      <Row
        gutter={18}
        style={{
          paddingTop: "12px",
        }}
      >
        <Col span={12}>
          <Form.Item
            label="Machine Name"
            name="machine_name"
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Select
              value={machineName}
              onChange={setMachineName}
              placeholder="Select Machine Name"
              loading={isLoadingMachineList}
              showSearch
              options={machineListRes?.rows?.map((machine) => ({
                label: machine?.machine_name,
                value: machine?.machine_name,
              }))}
              style={{
                textTransform: "capitalize",
              }}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label="Machine No"
            name="machine_no"
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Select
              value={machineNo}
              onChange={setMachineNo}
              placeholder="Select Machine No"
              loading={isLoadingMachineList}
              showSearch
              options={machineNoOption?.map((item) => ({
                label: item,
                value: item,
              }))}
              style={{
                textTransform: "capitalize",
              }}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Flex gap={10} justify="flex-end">
        <Button htmlType="button" onClick={handleCancel}>
          Cancel
        </Button>

        <Button
          type="primary"
          htmlType="submit"
          loading={isPendingReloadBeam}
          onClick={onSubmit}
        >
          Move to Bhidan
        </Button>
      </Flex>
    </Modal>
  );
};

export default MoveBhidanModal;
