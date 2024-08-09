import { useContext, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCompanyMachineListRequest } from "../../api/requests/machine";
import { GlobalContext } from "../../contexts/GlobalContext";
import {
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Select,
  Typography,
  message,
} from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import { getInHouseQualityListRequest } from "../../api/requests/qualityMaster";
import {
  createNBNBeamRequest,
  getLoadedMachineListRequest,
} from "../../api/requests/beamCard";

const LoadNewBeamModal = ({ isModalOpen, setIsModalOpen }) => {
  const queryClient = useQueryClient();

  const { companyId } = useContext(GlobalContext);

  const { mutateAsync: AddNBNBeamLoad, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await createNBNBeamRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["new", "beam", "add"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["beamCard", "list", companyId]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      setIsModalOpen(false);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const {
    control,
    formState: { errors },
    getValues,
    watch,
  } = useForm({
    defaultValues: {
      machine_name: null,
    },
  });
  const { machine_name } = watch();

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

  const { data: loadedMachineList } = useQuery({
    queryKey: [
      "loaded",
      "machine",
      "list",
      { company_id: companyId, machine_name },
    ],
    queryFn: async () => {
      if (machine_name) {
        const res = await getLoadedMachineListRequest({
          params: { company_id: companyId, machine_name },
        });

        return res.data?.data;
      }
    },
    enabled: Boolean(companyId),
    initialData: { rows: [], machineDetail: {} },
  });

  const { data: dropDownQualityListRes, isLoading: dropDownQualityLoading } =
    useQuery({
      queryKey: [
        "dropDownQualityListRes",
        "list",
        {
          company_id: companyId,
          machine_name: machine_name,
          page: 0,
          pageSize: 99999,
          is_active: 1,
        },
      ],
      queryFn: async () => {
        if (machine_name) {
          const res = await getInHouseQualityListRequest({
            params: {
              company_id: companyId,
              machine_name: machine_name,
              page: 0,
              pageSize: 99999,
              is_active: 1,
            },
          });
          return res.data?.data;
        } else {
          return { row: [] };
        }
      },
      enabled: Boolean(companyId),
    });

  const lastBeamNo = useMemo(() => {
    if (loadedMachineList.lastBeam) {
      const digits = loadedMachineList.lastBeam.match(/\d+/g);

      // Convert the array of digits to a single string or a number
      const result = digits ? digits.join("") : "";

      return +result || 0;
    } else {
      return 0;
    }
  }, [loadedMachineList]);

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

  const checkClickHandler = ({ index, machine_no, beam_no }) => {
    const quality_id = getValues(`quality_id_${index}`);
    const taka = +getValues(`taka_${index}`);
    const meter = +getValues(`meter_${index}`);
    const pano = +getValues(`pano_${index}`);
    const tar = +getValues(`tar_${index}`);

    if (!quality_id || !taka || !meter || !pano || !tar) {
      message.error("All fields are blank.");
      return;
    }

    const payload = {
      machine_name: getValues("machine_name"),
      BeamDetails: [
        {
          machine_no: machine_no,
          quality_id: quality_id,
          meters: meter,
          // peak: null,
          // read: null,
          beam_no,
          taka,
          pano,
          ends_or_tars: tar,
        },
      ],
    };

    AddNBNBeamLoad(payload);
  };

  const saveHandler = () => {
    if (machine_name && machineNoOption.length) {
      const BeamDetails = [];
      machineNoOption.forEach((item, index) => {
        const beamNo = `NBN-${lastBeamNo + (index + 1)}`;
        const quality_id = getValues(`quality_id_${index}`);
        const taka = +getValues(`taka_${index}`);
        const meters = +getValues(`meter_${index}`);
        const pano = +getValues(`pano_${index}`);
        const tar = +getValues(`tar_${index}`);
        if (quality_id && taka && meters && pano && tar) {
          BeamDetails.push({
            machine_no: item,
            beam_no: beamNo,
            quality_id,
            taka,
            meters,
            pano,
            ends_or_tars: tar,
            // peak: null,
            // read: null,
          });
        }
      });

      const finalPayload = {
        machine_name,
        BeamDetails,
      };
      AddNBNBeamLoad(finalPayload);
    }
  };

  return (
    <Modal
      closeIcon={<CloseOutlined className="text-white" />}
      title={
        <Typography.Text className="text-xl font-medium text-white">
          Load new beam
        </Typography.Text>
      }
      open={isModalOpen}
      footer={null}
      onCancel={() => setIsModalOpen(false)}
      centered={true}
      className="view-in-house-quality-model"
      classNames={{
        header: "text-center",
      }}
      width={"100%"}
      styles={{
        content: {
          padding: 0,
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
      <Flex gap={10} justify="space-between" align="center">
        <Form.Item
          label="Machine Name"
          name="machine_name"
          validateStatus={errors.machine_name ? "error" : ""}
          help={errors.machine_name && errors.machine_name.message}
          required={true}
          wrapperCol={{ sm: 24 }}
        >
          <Controller
            control={control}
            name="machine_name"
            render={({ field }) => (
              <Select
                {...field}
                allowClear
                placeholder="Select Machine Name"
                loading={isLoadingMachineList}
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
            )}
          />
        </Form.Item>
        <Button
          type="primary"
          disabled={!machineNoOption.length}
          loading={isPending}
          onClick={saveHandler}
        >
          Save
        </Button>
      </Flex>

      <table border={1} className="custom-table">
        <thead>
          <tr className="font-semibold">
            <th align="center">Machine No</th>
            <th align="center">Beam no</th>
            <th align="center">Quality</th>
            <th align="center">Taka</th>
            <th align="center">Meter</th>
            <th align="center">Pano</th>
            <th align="center">Tar</th>
            <th align="center">Save</th>
          </tr>
        </thead>
        <tbody>
          {machineNoOption.map((item, index) => {
            const beamNo = `NBN-${lastBeamNo + (index + 1)}`;
            return (
              <tr key={index + "_load_new_beam"}>
                <td width={100}>
                  <Typography.Text>{item}</Typography.Text>
                </td>
                <td width={120}>
                  <Typography.Text>{beamNo}</Typography.Text>
                </td>
                <td width={270}>
                  <Controller
                    control={control}
                    name={`quality_id_${index}`}
                    render={({ field }) => {
                      return (
                        <Select
                          {...field}
                          name={`quality_id_${index}`}
                          placeholder="Select Quality"
                          loading={dropDownQualityLoading}
                          style={{ width: "100%" }}
                          options={
                            dropDownQualityListRes &&
                            dropDownQualityListRes?.rows?.map((item) => ({
                              value: item.id,
                              label: item.quality_name,
                            }))
                          }
                        />
                      );
                    }}
                  />
                </td>
                <td width={70}>
                  <Controller
                    control={control}
                    name={`taka_${index}`}
                    render={({ field }) => {
                      return (
                        <Input
                          {...field}
                          type="number"
                          name={`taka_${index}`}
                          placeholder="12"
                          style={{ width: "100%" }}
                        />
                      );
                    }}
                  />
                </td>
                <td width={70}>
                  <Controller
                    control={control}
                    name={`meter_${index}`}
                    render={({ field }) => {
                      return (
                        <Input
                          {...field}
                          type="number"
                          name={`meter_${index}`}
                          placeholder="12"
                          style={{ width: "100%" }}
                        />
                      );
                    }}
                  />
                </td>
                <td width={70}>
                  <Controller
                    control={control}
                    name={`pano_${index}`}
                    render={({ field }) => {
                      return (
                        <Input
                          {...field}
                          type="number"
                          name={`pano_${index}`}
                          placeholder="12"
                          style={{ width: "100%" }}
                        />
                      );
                    }}
                  />
                </td>
                <td width={70}>
                  <Controller
                    control={control}
                    name={`tar_${index}`}
                    render={({ field }) => {
                      return (
                        <Input
                          {...field}
                          type="number"
                          name={`tar_${index}`}
                          placeholder="12"
                          style={{ width: "100%" }}
                        />
                      );
                    }}
                  />
                </td>
                <td width={100}>
                  <Button
                    disabled={isPending}
                    type="secondary"
                    icon={<CheckOutlined />}
                    onClick={() =>
                      checkClickHandler({
                        index,
                        machine_no: item,
                        beam_no: beamNo,
                      })
                    }
                  ></Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Modal>
  );
};

export default LoadNewBeamModal;
